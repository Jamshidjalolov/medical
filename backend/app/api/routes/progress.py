from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.entities import Certificate, CertificateExamAttempt, LearningItem, LearningProgress, Topic, TopicQuizAttempt, User
from app.schemas.progress import LearningProgressUpsertRequest, TopicQuizSubmitRequest
from app.services.exams import calculate_score
from app.services.serializers import serialize_certificate, serialize_exam_attempt, serialize_topic_attempt

router = APIRouter()


@router.get("/me")
def my_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    learning_entries = db.scalars(
        select(LearningProgress)
        .where(LearningProgress.user_id == current_user.id)
        .order_by(LearningProgress.completed_at.desc())
    ).all()

    topic_attempts = db.scalars(
        select(TopicQuizAttempt)
        .where(TopicQuizAttempt.user_id == current_user.id)
        .options(selectinload(TopicQuizAttempt.topic))
        .order_by(TopicQuizAttempt.completed_at.desc())
    ).all()

    latest_topic_results: dict[str, dict] = {}
    completed_topics: set[str] = set()
    for attempt in topic_attempts:
        if attempt.topic_id not in latest_topic_results:
            latest_topic_results[attempt.topic_id] = serialize_topic_attempt(attempt)
        if attempt.passed:
            completed_topics.add(attempt.topic_id)

    completed_learning_items_by_topic: dict[str, list[str]] = {}
    for entry in learning_entries:
        completed_learning_items_by_topic.setdefault(entry.topic_id, []).append(entry.learning_item_id)

    completed_learning_items_by_topic = {
        topic_id: sorted(set(item_ids)) for topic_id, item_ids in completed_learning_items_by_topic.items()
    }

    latest_exam_attempt = db.scalar(
        select(CertificateExamAttempt)
        .where(CertificateExamAttempt.user_id == current_user.id)
        .order_by(CertificateExamAttempt.completed_at.desc())
    )
    certificates = db.scalars(
        select(Certificate).where(Certificate.user_id == current_user.id).order_by(Certificate.issue_date.desc())
    ).all()

    return {
        "reviewedTopics": sorted({entry.topic_id for entry in learning_entries}),
        "completedTopics": sorted(completed_topics),
        "completedLearningItemsByTopic": completed_learning_items_by_topic,
        "topicQuizResults": latest_topic_results,
        "certificateExamResult": serialize_exam_attempt(latest_exam_attempt) if latest_exam_attempt else None,
        "generatedCertificate": serialize_certificate(certificates[0]) if certificates else None,
        "certificateHistory": [serialize_certificate(item) for item in certificates],
    }


@router.post("/learning-items/complete", status_code=status.HTTP_201_CREATED)
def complete_learning_item(
    payload: LearningProgressUpsertRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    learning_item = db.get(LearningItem, payload.learningItemId)
    if learning_item is None or learning_item.topic_id != payload.topicId:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="O'rganish kartasi topilmadi.")

    existing = db.scalar(
        select(LearningProgress).where(
            LearningProgress.user_id == current_user.id,
            LearningProgress.learning_item_id == payload.learningItemId,
        )
    )
    if existing is None:
        db.add(
            LearningProgress(
                user_id=current_user.id,
                topic_id=payload.topicId,
                learning_item_id=payload.learningItemId,
            )
        )
        db.commit()

    return {
        "message": "Karta bajarildi deb belgilandi.",
        "topicId": payload.topicId,
        "learningItemId": payload.learningItemId,
    }


@router.post("/topic-quizzes/{topic_id}/submit", status_code=status.HTTP_201_CREATED)
def submit_topic_quiz(
    topic_id: str,
    payload: TopicQuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    topic = db.scalar(
        select(Topic)
        .where(Topic.id == topic_id, Topic.is_published.is_(True))
        .options(selectinload(Topic.quiz_questions))
    )
    if topic is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mavzu topilmadi.")

    questions = list(sorted(topic.quiz_questions, key=lambda item: item.sort_order))
    if not questions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bu mavzu uchun savollar yo'q.")

    result = calculate_score(questions, payload.answers)
    attempt = TopicQuizAttempt(
        user_id=current_user.id,
        topic_id=topic.id,
        answers=payload.answers,
        score=result["score"],
        total=result["total"],
        correct_count=result["correctCount"],
        wrong_count=result["wrongCount"],
        threshold=settings.topic_passing_score,
        passed=result["score"] >= settings.topic_passing_score,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    attempt.topic = topic
    return serialize_topic_attempt(attempt)
