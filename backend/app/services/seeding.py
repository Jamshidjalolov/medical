from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.core.security import hash_password
from app.models.entities import LearningItem, QuizQuestion, Topic, User

SEED_FILE = Path(__file__).resolve().parents[1] / "seed" / "initial_topics.json"


def load_seed_payload() -> dict:
    if not SEED_FILE.exists():
        return {"topics": []}
    return json.loads(SEED_FILE.read_text(encoding="utf-8"))


def ensure_default_admin(db: Session) -> None:
    email = settings.default_admin_email.strip().lower()
    admin = db.scalar(select(User).where(User.email == email))

    if admin is None:
        db.add(
            User(
                first_name="Admin",
                last_name="Panel",
                email=email,
                password_hash=hash_password(settings.default_admin_password),
                roles=["admin"],
            )
        )
        db.commit()
        return

    roles = list(admin.roles or [])
    if "admin" not in roles:
        admin.roles = ["admin", *roles]
        db.add(admin)
        db.commit()


def seed_topics(db: Session) -> None:
    payload = load_seed_payload()
    seed_topics_data = payload.get("topics", [])
    if not seed_topics_data:
        return

    existing_topics = db.scalars(
        select(Topic).options(selectinload(Topic.learn_items), selectinload(Topic.quiz_questions))
    ).unique().all()
    topics_by_id = {topic.id: topic for topic in existing_topics}
    changed = False

    for topic_data in seed_topics_data:
        topic = topics_by_id.get(topic_data["id"])

        if topic is None:
            topic = Topic(
                id=topic_data["id"],
                title=topic_data["title"],
                description=topic_data.get("description", ""),
                glyph=topic_data.get("glyph"),
                palette=topic_data.get("palette", {}),
                image=topic_data.get("image"),
                fallback_image=topic_data.get("fallbackImage"),
                sort_order=topic_data.get("sortOrder", 0),
                is_published=True,
            )

            for item_data in topic_data.get("learnItems", []):
                topic.learn_items.append(
                    LearningItem(
                        id=item_data["id"],
                        title=item_data["title"],
                        description=item_data.get("description", ""),
                        quiz_question=item_data.get("quizQuestion"),
                        image=item_data.get("image"),
                        fallback_image=item_data.get("fallbackImage"),
                        sort_order=item_data.get("sortOrder", 0),
                    )
                )

            for question_data in topic_data.get("quizQuestions", []):
                topic.quiz_questions.append(
                    QuizQuestion(
                        id=question_data["id"],
                        learning_item_id=question_data.get("learningItemId"),
                        question=question_data["question"],
                        options=question_data.get("options", []),
                        correct_answer=question_data["correctAnswer"],
                        sort_order=question_data.get("sortOrder", 0),
                    )
                )

            db.add(topic)
            changed = True
            continue

        existing_item_ids = {item.id for item in topic.learn_items}
        for item_data in topic_data.get("learnItems", []):
            if item_data["id"] in existing_item_ids:
                continue

            topic.learn_items.append(
                LearningItem(
                    id=item_data["id"],
                    title=item_data["title"],
                    description=item_data.get("description", ""),
                    quiz_question=item_data.get("quizQuestion"),
                    image=item_data.get("image"),
                    fallback_image=item_data.get("fallbackImage"),
                    sort_order=item_data.get("sortOrder", 0),
                )
            )
            changed = True

        existing_question_ids = {question.id for question in topic.quiz_questions}
        for question_data in topic_data.get("quizQuestions", []):
            if question_data["id"] in existing_question_ids:
                continue

            topic.quiz_questions.append(
                QuizQuestion(
                    id=question_data["id"],
                    learning_item_id=question_data.get("learningItemId"),
                    question=question_data["question"],
                    options=question_data.get("options", []),
                    correct_answer=question_data["correctAnswer"],
                    sort_order=question_data.get("sortOrder", 0),
                )
            )
            changed = True

    if changed:
        db.commit()


def seed_all(db: Session) -> None:
    ensure_default_admin(db)
    seed_topics(db)
