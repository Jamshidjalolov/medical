from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def generate_uuid() -> str:
    return str(uuid.uuid4())


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    first_name: Mapped[str] = mapped_column(String(120), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    roles: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    registered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    last_login_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    learning_entries: Mapped[list["LearningProgress"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    topic_quiz_attempts: Mapped[list["TopicQuizAttempt"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    certificate_exam_attempts: Mapped[list["CertificateExamAttempt"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    certificates: Mapped[list["Certificate"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Topic(TimestampMixin, Base):
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    glyph: Mapped[str | None] = mapped_column(String(12), nullable=True)
    palette: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    image: Mapped[str | None] = mapped_column(Text, nullable=True)
    fallback_image: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    learn_items: Mapped[list["LearningItem"]] = relationship(
        back_populates="topic", cascade="all, delete-orphan", order_by="LearningItem.sort_order"
    )
    quiz_questions: Mapped[list["QuizQuestion"]] = relationship(
        back_populates="topic", cascade="all, delete-orphan", order_by="QuizQuestion.sort_order"
    )
    learning_entries: Mapped[list["LearningProgress"]] = relationship(back_populates="topic")
    quiz_attempts: Mapped[list["TopicQuizAttempt"]] = relationship(back_populates="topic")


class LearningItem(TimestampMixin, Base):
    __tablename__ = "learning_items"

    id: Mapped[str] = mapped_column(String(140), primary_key=True)
    topic_id: Mapped[str] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    quiz_question: Mapped[str | None] = mapped_column(Text, nullable=True)
    image: Mapped[str | None] = mapped_column(Text, nullable=True)
    fallback_image: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    topic: Mapped["Topic"] = relationship(back_populates="learn_items")
    quiz_questions: Mapped[list["QuizQuestion"]] = relationship(back_populates="learning_item")
    progress_entries: Mapped[list["LearningProgress"]] = relationship(back_populates="learning_item")


class QuizQuestion(TimestampMixin, Base):
    __tablename__ = "quiz_questions"

    id: Mapped[str] = mapped_column(String(140), primary_key=True)
    topic_id: Mapped[str] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True, nullable=False)
    learning_item_id: Mapped[str | None] = mapped_column(
        ForeignKey("learning_items.id", ondelete="SET NULL"), index=True, nullable=True
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    correct_answer: Mapped[str] = mapped_column(String(255), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    topic: Mapped["Topic"] = relationship(back_populates="quiz_questions")
    learning_item: Mapped["LearningItem | None"] = relationship(back_populates="quiz_questions")


class LearningProgress(TimestampMixin, Base):
    __tablename__ = "learning_progress"
    __table_args__ = (UniqueConstraint("user_id", "learning_item_id", name="uq_learning_progress_user_item"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    topic_id: Mapped[str] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True, nullable=False)
    learning_item_id: Mapped[str] = mapped_column(
        ForeignKey("learning_items.id", ondelete="CASCADE"), index=True, nullable=False
    )
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user: Mapped["User"] = relationship(back_populates="learning_entries")
    topic: Mapped["Topic"] = relationship(back_populates="learning_entries")
    learning_item: Mapped["LearningItem"] = relationship(back_populates="progress_entries")


class TopicQuizAttempt(TimestampMixin, Base):
    __tablename__ = "topic_quiz_attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    topic_id: Mapped[str] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True, nullable=False)
    answers: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    total: Mapped[int] = mapped_column(Integer, nullable=False)
    correct_count: Mapped[int] = mapped_column(Integer, nullable=False)
    wrong_count: Mapped[int] = mapped_column(Integer, nullable=False)
    threshold: Mapped[int] = mapped_column(Integer, default=70, nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user: Mapped["User"] = relationship(back_populates="topic_quiz_attempts")
    topic: Mapped["Topic"] = relationship(back_populates="quiz_attempts")


class CertificateExamAttempt(TimestampMixin, Base):
    __tablename__ = "certificate_exam_attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    question_ids: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    answers: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    total: Mapped[int] = mapped_column(Integer, nullable=False)
    correct_count: Mapped[int] = mapped_column(Integer, nullable=False)
    wrong_count: Mapped[int] = mapped_column(Integer, nullable=False)
    threshold: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    breakdown: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user: Mapped["User"] = relationship(back_populates="certificate_exam_attempts")
    certificate: Mapped["Certificate | None"] = relationship(back_populates="exam_attempt", uselist=False)


class Certificate(TimestampMixin, Base):
    __tablename__ = "certificates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    exam_attempt_id: Mapped[str | None] = mapped_column(
        ForeignKey("certificate_exam_attempts.id", ondelete="SET NULL"), unique=True, nullable=True
    )
    serial_number: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    total: Mapped[int] = mapped_column(Integer, nullable=False)
    correct_count: Mapped[int] = mapped_column(Integer, nullable=False)
    wrong_count: Mapped[int] = mapped_column(Integer, nullable=False)
    issue_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    achievement: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    breakdown: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)

    user: Mapped["User"] = relationship(back_populates="certificates")
    exam_attempt: Mapped["CertificateExamAttempt | None"] = relationship(back_populates="certificate")
