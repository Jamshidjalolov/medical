from __future__ import annotations

from typing import Any

from pydantic import Field, field_validator

from app.schemas.common import StrictModel


class RoleUpdateRequest(StrictModel):
    roles: list[str] = Field(min_length=1)

    @field_validator("roles")
    @classmethod
    def normalize_roles(cls, value: list[str]) -> list[str]:
        normalized = []
        for role in value:
            current = role.strip().lower()
            if current and current not in normalized:
                normalized.append(current)
        if not normalized:
            raise ValueError("Kamida bitta rol kerak.")
        return normalized


class UserStatusPayload(StrictModel):
    isActive: bool


class TopicPayload(StrictModel):
    id: str | None = None
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    glyph: str | None = Field(default=None, max_length=12)
    palette: dict[str, Any] = Field(default_factory=dict)
    image: str | None = None
    fallbackImage: str | None = None
    sortOrder: int | None = None
    isPublished: bool = True

    @field_validator("id", "title", "description", "glyph", "image", "fallbackImage", mode="before")
    @classmethod
    def strip_values(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip()


class LearningItemPayload(StrictModel):
    id: str | None = None
    topicId: str | None = None
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    quizQuestion: str | None = None
    image: str | None = None
    fallbackImage: str | None = None
    sortOrder: int | None = None

    @field_validator("id", "topicId", "title", "description", "quizQuestion", "image", "fallbackImage", mode="before")
    @classmethod
    def strip_values(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip()


class QuizQuestionPayload(StrictModel):
    id: str | None = None
    topicId: str | None = None
    learningItemId: str | None = None
    question: str = Field(min_length=1)
    options: list[str] = Field(min_length=4, max_length=4)
    correctAnswer: str = Field(min_length=1)
    sortOrder: int | None = None

    @field_validator("id", "topicId", "learningItemId", "question", "correctAnswer", mode="before")
    @classmethod
    def strip_values(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip()

    @field_validator("options")
    @classmethod
    def validate_options(cls, value: list[str]) -> list[str]:
        options = [item.strip() for item in value if item.strip()]
        if len(options) != 4:
            raise ValueError("4 ta variant kerak.")
        return options
