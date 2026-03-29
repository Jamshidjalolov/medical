from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.entities import Topic
from app.services.serializers import serialize_question, serialize_topic

router = APIRouter()


def get_topic_or_404(db: Session, topic_id: str, include_unpublished: bool = False) -> Topic:
    statement = (
        select(Topic)
        .where(Topic.id == topic_id)
        .options(selectinload(Topic.learn_items), selectinload(Topic.quiz_questions))
    )
    if not include_unpublished:
        statement = statement.where(Topic.is_published.is_(True))

    topic = db.scalar(statement)
    if topic is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mavzu topilmadi.")
    return topic


@router.get("")
def list_topics(
    includeDrafts: bool = Query(default=False),
    includeDetails: bool = Query(default=False),
    db: Session = Depends(get_db),
) -> list[dict]:
    statement = (
        select(Topic)
        .options(selectinload(Topic.learn_items), selectinload(Topic.quiz_questions))
        .order_by(Topic.sort_order, Topic.title)
    )
    if not includeDrafts:
        statement = statement.where(Topic.is_published.is_(True))

    topics = db.scalars(statement).unique().all()
    return [serialize_topic(topic, include_relations=includeDetails) for topic in topics]


@router.get("/{topic_id}")
def topic_detail(topic_id: str, db: Session = Depends(get_db)) -> dict:
    topic = get_topic_or_404(db, topic_id)
    return serialize_topic(topic, include_relations=True, include_answers=False)


@router.get("/{topic_id}/quiz")
def topic_quiz_questions(topic_id: str, db: Session = Depends(get_db)) -> dict:
    topic = get_topic_or_404(db, topic_id)
    return {
        "topic": serialize_topic(topic, include_relations=False),
        "questions": [serialize_question(question, include_answer=False) for question in topic.quiz_questions],
    }
