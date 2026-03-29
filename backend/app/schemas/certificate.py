from __future__ import annotations

from pydantic import Field, field_validator

from app.schemas.common import StrictModel


class CertificateExamSubmitRequest(StrictModel):
    questionIds: list[str] = Field(min_length=1)
    answers: dict[str, str] = Field(default_factory=dict)

    @field_validator("questionIds")
    @classmethod
    def unique_question_ids(cls, value: list[str]) -> list[str]:
        unique = list(dict.fromkeys([item.strip() for item in value if item.strip()]))
        if not unique:
            raise ValueError("questionIds bo'sh bo'lmasligi kerak.")
        return unique


class CertificateGenerateRequest(StrictModel):
    attemptId: str = Field(min_length=1)
    fullName: str | None = Field(default=None, max_length=255)
    firstName: str | None = Field(default=None, max_length=120)
    lastName: str | None = Field(default=None, max_length=120)

    @field_validator("fullName", "firstName", "lastName", mode="before")
    @classmethod
    def strip_names(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip()
