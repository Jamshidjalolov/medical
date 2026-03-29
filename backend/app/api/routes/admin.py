from __future__ import annotations

import re
from collections import Counter
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import require_roles
from app.core.config import BACKEND_DIR, settings
from app.db.session import get_db
from app.models.entities import Certificate, LearningItem, QuizQuestion, Topic, User
from app.schemas.admin import LearningItemPayload, QuizQuestionPayload, RoleUpdateRequest, TopicPayload, UserStatusPayload
from app.schemas.common import MessageResponse
from app.services.serializers import serialize_certificate, serialize_topic, serialize_user

router = APIRouter()
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
ALLOWED_UPLOAD_SCOPES = {"topics", "learning-items"}


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.strip().lower()).strip("-")


def load_topic_full(db: Session, topic_id: str) -> Topic:
    topic = db.scalar(
        select(Topic)
        .where(Topic.id == topic_id)
        .options(selectinload(Topic.learn_items), selectinload(Topic.quiz_questions))
    )
    if topic is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mavzu topilmadi.")
    return topic


def normalize_upload_scope(value: str) -> str:
    return re.sub(r"[^a-z0-9-]+", "-", value.strip().lower()).strip("-")


@router.get("/overview")
def overview(_: User = Depends(require_roles("admin")), db: Session = Depends(get_db)) -> dict:
    return {
        "usersCount": db.scalar(select(func.count()).select_from(User)) or 0,
        "topicsCount": db.scalar(select(func.count()).select_from(Topic)) or 0,
        "learningItemsCount": db.scalar(select(func.count()).select_from(LearningItem)) or 0,
        "questionsCount": db.scalar(select(func.count()).select_from(QuizQuestion)) or 0,
        "certificatesCount": db.scalar(select(func.count()).select_from(Certificate)) or 0,
        "certificateHoldersCount": db.scalar(select(func.count(func.distinct(Certificate.user_id)))) or 0,
    }


@router.get("/users")
def admin_users(_: User = Depends(require_roles("admin")), db: Session = Depends(get_db)) -> list[dict]:
    users = db.scalars(
        select(User)
        .options(
            selectinload(User.certificates),
            selectinload(User.topic_quiz_attempts),
            selectinload(User.learning_entries),
        )
        .order_by(User.registered_at.desc())
    ).all()
    return [serialize_user(user, include_stats=True) for user in users]


@router.patch("/users/{user_id}/roles")
def update_user_roles(
    user_id: str,
    payload: RoleUpdateRequest,
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> dict:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Foydalanuvchi topilmadi.")
    user.roles = payload.roles
    db.add(user)
    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: str,
    payload: UserStatusPayload,
    current_admin: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> dict:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Foydalanuvchi topilmadi.")

    if user.id == current_admin.id and not payload.isActive:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="O'zingizni bloklay olmaysiz.")

    user.is_active = payload.isActive
    db.add(user)
    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: str,
    current_admin: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> MessageResponse:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Foydalanuvchi topilmadi.")

    if user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin o'zini o'chira olmaydi.")

    db.delete(user)
    db.commit()
    return MessageResponse(message="Foydalanuvchi o'chirildi.")


@router.get("/topics")
def admin_topics(_: User = Depends(require_roles("admin")), db: Session = Depends(get_db)) -> list[dict]:
    topics = db.scalars(
        select(Topic)
        .options(selectinload(Topic.learn_items), selectinload(Topic.quiz_questions))
        .order_by(Topic.sort_order, Topic.title)
    ).unique().all()
    return [serialize_topic(topic, include_relations=True, include_answers=True) for topic in topics]


@router.post("/uploads/image", status_code=status.HTTP_201_CREATED)
async def upload_image(
    request: Request,
    scope: str = Form("topics"),
    file: UploadFile = File(...),
    _: User = Depends(require_roles("admin")),
) -> dict:
    normalized_scope = normalize_upload_scope(scope)
    if normalized_scope not in ALLOWED_UPLOAD_SCOPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Noto'g'ri upload bo'limi.")

    original_name = file.filename or "image"
    extension = Path(original_name).suffix.lower()
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Faqat rasm fayllarini yuklash mumkin.")

    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Faqat rasm fayllarini yuklash mumkin.")

    content = await file.read()
    await file.close()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bo'sh fayl yuklab bo'lmaydi.")
    if len(content) > settings.upload_max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Rasm hajmi {settings.upload_max_bytes // (1024 * 1024)} MB dan oshmasligi kerak.",
        )

    upload_dir = BACKEND_DIR / "uploads" / normalized_scope
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}{extension}"
    target_path = upload_dir / filename
    target_path.write_bytes(content)

    relative_path = f"{normalized_scope}/{filename}"
    return {
        "url": str(request.url_for("uploads", path=relative_path)),
        "filename": filename,
        "scope": normalized_scope,
    }


@router.post("/topics", status_code=status.HTTP_201_CREATED)
def create_topic(payload: TopicPayload, _: User = Depends(require_roles("admin")), db: Session = Depends(get_db)) -> dict:
    topic_id = payload.id or slugify(payload.title)
    if not topic_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Topic id yaratilmadi.")
    if db.get(Topic, topic_id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bunday mavzu allaqachon mavjud.")

    max_sort = db.scalar(select(func.max(Topic.sort_order))) or 0
    topic = Topic(
        id=topic_id,
        title=payload.title,
        description=payload.description,
        glyph=payload.glyph,
        palette=payload.palette,
        image=payload.image,
        fallback_image=payload.fallbackImage,
        sort_order=payload.sortOrder if payload.sortOrder is not None else max_sort + 1,
        is_published=payload.isPublished,
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return serialize_topic(topic, include_relations=True, include_answers=True)


@router.put("/topics/{topic_id}")
def update_topic(
    topic_id: str,
    payload: TopicPayload,
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> dict:
    topic = load_topic_full(db, topic_id)
    topic.title = payload.title
    topic.description = payload.description
    topic.glyph = payload.glyph
    topic.palette = payload.palette
    topic.image = payload.image
    topic.fallback_image = payload.fallbackImage
    if payload.sortOrder is not None:
        topic.sort_order = payload.sortOrder
    topic.is_published = payload.isPublished
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return serialize_topic(topic, include_relations=True, include_answers=True)


@router.delete("/topics/{topic_id}", response_model=MessageResponse)
def delete_topic(
    topic_id: str,
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> MessageResponse:
    topic = load_topic_full(db, topic_id)
    db.delete(topic)
    db.commit()
    return MessageResponse(message="Mavzu o'chirildi.")


@router.post("/topics/{topic_id}/learning-items", status_code=status.HTTP_201_CREATED)
def create_learning_item(
    topic_id: str,
    payload: LearningItemPayload,
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> dict:
    topic = load_topic_full(db, topic_id)
    item_id = payload.id or f"{topic_id}-item-{len(topic.learn_items) + 1}"
    if db.get(LearningItem, item_id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bunday karta allaqachon mavjud.")

    item = LearningItem(
        id=item_id,
        topic_id=topic_id,
        title=payload.title,
        description=payload.description,
        quiz_question=payload.quizQuestion,
        image=payload.image,
        fallback_image=payload.fallbackImage,
        sort_order=payload.sortOrder if payload.sortOrder is not None else len(topic.learn_items),
    )
    db.add(item)
    db.commit()
    return serialize_topic(load_topic_full(db, topic_id), include_relations=True, include_answers=True)


@router.put("/learning-items/{item_id}")
def update_learning_item(
    item_id: str,
    payload: LearningItemPayload,
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> dict:
    item = db.get(LearningItem, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Karta topilmadi.")

    if payload.topicId:
        if db.get(Topic, payload.topicId) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Yangi mavzu topilmadi.")
        item.topic_id = payload.topicId

    item.title = payload.title
    item.description = payload.description
    item.quiz_question = payload.quizQuestion
    item.image = payload.image
    item.fallback_image = payload.fallbackImage
    if payload.sortOrder is not None:
        item.sort_order = payload.sortOrder

    db.add(item)
    db.commit()
    return serialize_topic(load_topic_full(db, item.topic_id), include_relations=True, include_answers=True)


@router.delete("/learning-items/{item_id}", response_model=MessageResponse)
def delete_learning_item(
    item_id: str,
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> MessageResponse:
    item = db.get(LearningItem, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Karta topilmadi.")
    db.delete(item)
    db.commit()
    return MessageResponse(message="Karta o'chirildi.")


@router.post("/topics/{topic_id}/questions", status_code=status.HTTP_201_CREATED)
def create_question(
    topic_id: str,
    payload: QuizQuestionPayload,
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> dict:
    topic = load_topic_full(db, topic_id)
    question_id = payload.id or f"{topic_id}-quiz-{len(topic.quiz_questions) + 1}"
    if db.get(QuizQuestion, question_id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bunday savol allaqachon mavjud.")

    db.add(
        QuizQuestion(
            id=question_id,
            topic_id=topic_id,
            learning_item_id=payload.learningItemId,
            question=payload.question,
            options=payload.options,
            correct_answer=payload.correctAnswer,
            sort_order=payload.sortOrder if payload.sortOrder is not None else len(topic.quiz_questions),
        )
    )
    db.commit()
    return serialize_topic(load_topic_full(db, topic_id), include_relations=True, include_answers=True)


@router.put("/questions/{question_id}")
def update_question(
    question_id: str,
    payload: QuizQuestionPayload,
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> dict:
    question = db.get(QuizQuestion, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savol topilmadi.")

    next_topic_id = payload.topicId or question.topic_id
    if db.get(Topic, next_topic_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mavzu topilmadi.")

    question.topic_id = next_topic_id
    question.learning_item_id = payload.learningItemId
    question.question = payload.question
    question.options = payload.options
    question.correct_answer = payload.correctAnswer
    if payload.sortOrder is not None:
        question.sort_order = payload.sortOrder

    db.add(question)
    db.commit()
    return serialize_topic(load_topic_full(db, question.topic_id), include_relations=True, include_answers=True)


@router.delete("/questions/{question_id}", response_model=MessageResponse)
def delete_question(
    question_id: str,
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> MessageResponse:
    question = db.get(QuizQuestion, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savol topilmadi.")
    db.delete(question)
    db.commit()
    return MessageResponse(message="Savol o'chirildi.")


@router.get("/certificates")
def admin_certificates(_: User = Depends(require_roles("admin")), db: Session = Depends(get_db)) -> dict:
    certificates = db.scalars(
        select(Certificate).options(selectinload(Certificate.user)).order_by(Certificate.issue_date.desc())
    ).all()

    counts = Counter(certificate.user_id for certificate in certificates)
    users = {certificate.user_id: certificate.user for certificate in certificates if certificate.user is not None}
    counts_by_user = [
        {
            "userId": user_id,
            "fullName": f"{users[user_id].first_name} {users[user_id].last_name}".strip() if user_id in users else "",
            "email": users[user_id].email if user_id in users else "",
            "count": count,
        }
        for user_id, count in counts.most_common()
    ]

    return {"items": [serialize_certificate(item) for item in certificates], "countsByUser": counts_by_user}


@router.delete("/certificates/{certificate_id}", response_model=MessageResponse)
def delete_certificate(
    certificate_id: str,
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> MessageResponse:
    certificate = db.get(Certificate, certificate_id)
    if certificate is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sertifikat topilmadi.")

    db.delete(certificate)
    db.commit()
    return MessageResponse(message="Sertifikat o'chirildi.")
