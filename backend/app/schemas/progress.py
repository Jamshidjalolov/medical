from __future__ import annotations

from pydantic import Field

from app.schemas.common import StrictModel


class LearningProgressUpsertRequest(StrictModel):
    topicId: str = Field(min_length=1)
    learningItemId: str = Field(min_length=1)


class TopicQuizSubmitRequest(StrictModel):
    answers: dict[str, str] = Field(default_factory=dict)
