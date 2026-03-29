from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.entities import Certificate, CertificateExamAttempt, QuizQuestion, Topic, User
from app.schemas.certificate import CertificateExamSubmitRequest, CertificateGenerateRequest
from app.services.exams import build_topic_breakdown, calculate_score, create_certificate_serial, get_achievement_meta, pick_random_questions
from app.services.serializers import serialize_certificate, serialize_exam_attempt, serialize_question

router = APIRouter()


@router.get("/exam/questions")
def exam_questions(count: int | None = Query(default=None, ge=1, le=100), db: Session = Depends(get_db)) -> dict:
    requested_count = count or settings.certificate_question_count
    questions = db.scalars(
        select(QuizQuestion)
        .where(QuizQuestion.topic.has(Topic.is_published.is_(True)))
        .options(selectinload(QuizQuestion.topic))
    ).all()
    picked = pick_random_questions(questions, requested_count)
    return {"count": len(picked), "questions": [serialize_question(question) for question in picked]}


@router.post("/exam/submit", status_code=status.HTTP_201_CREATED)
def submit_certificate_exam(
    payload: CertificateExamSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    questions = db.scalars(
        select(QuizQuestion)
        .where(QuizQuestion.id.in_(payload.questionIds))
        .options(selectinload(QuizQuestion.topic))
    ).all()
    questions_map = {question.id: question for question in questions}
    ordered_questions = [questions_map[question_id] for question_id in payload.questionIds if question_id in questions_map]

    if len(ordered_questions) != len(payload.questionIds):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Savollar to'plami to'liq topilmadi.")

    result = calculate_score(ordered_questions, payload.answers)
    threshold = settings.certificate_passing_score
    passed = result["score"] >= threshold if threshold > 0 else True

    attempt = CertificateExamAttempt(
        user_id=current_user.id,
        question_ids=payload.questionIds,
        answers=payload.answers,
        score=result["score"],
        total=result["total"],
        correct_count=result["correctCount"],
        wrong_count=result["wrongCount"],
        threshold=threshold,
        passed=passed,
        breakdown=build_topic_breakdown(ordered_questions, payload.answers),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return serialize_exam_attempt(attempt)


@router.post("/generate", status_code=status.HTTP_201_CREATED)
def generate_certificate(
    payload: CertificateGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    attempt = db.scalar(
        select(CertificateExamAttempt).where(
            CertificateExamAttempt.id == payload.attemptId,
            CertificateExamAttempt.user_id == current_user.id,
        )
    )
    if attempt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imtihon natijasi topilmadi.")

    existing = db.scalar(select(Certificate).where(Certificate.exam_attempt_id == attempt.id))
    if existing is not None:
        return serialize_certificate(existing)

    if not attempt.passed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sertifikat olish uchun kamida {attempt.threshold}% natija kerak.",
        )

    full_name = (
        (payload.fullName or "").strip()
        or f"{(payload.firstName or current_user.first_name).strip()} {(payload.lastName or current_user.last_name).strip()}".strip()
    )
    if not full_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ism-familya kiritilishi kerak.")

    certificate = Certificate(
        user_id=current_user.id,
        exam_attempt_id=attempt.id,
        serial_number=create_certificate_serial(),
        full_name=full_name,
        score=attempt.score,
        total=attempt.total,
        correct_count=attempt.correct_count,
        wrong_count=attempt.wrong_count,
        achievement=get_achievement_meta(attempt.score),
        breakdown=attempt.breakdown,
    )
    db.add(certificate)
    db.commit()
    db.refresh(certificate)
    return serialize_certificate(certificate)


@router.get("/me")
def my_certificates(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    certificates = db.scalars(
        select(Certificate).where(Certificate.user_id == current_user.id).order_by(Certificate.issue_date.desc())
    ).all()
    return [serialize_certificate(item) for item in certificates]
