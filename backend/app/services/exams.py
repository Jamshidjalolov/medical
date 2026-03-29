from __future__ import annotations

import random
from datetime import datetime

from app.models.entities import QuizQuestion


def calculate_score(questions: list[QuizQuestion], answers: dict[str, str]) -> dict[str, int]:
    correct_count = sum(1 for question in questions if answers.get(question.id) == question.correct_answer)
    total = len(questions)
    wrong_count = total - correct_count
    score = round((correct_count / total) * 100) if total else 0
    return {
        "score": score,
        "total": total,
        "correctCount": correct_count,
        "wrongCount": wrong_count,
    }


def build_topic_breakdown(questions: list[QuizQuestion], answers: dict[str, str]) -> list[dict]:
    summary: dict[str, dict] = {}
    for question in questions:
        current = summary.setdefault(
            question.topic_id,
            {
                "topicId": question.topic_id,
                "topicTitle": question.topic.title if question.topic else "",
                "correctCount": 0,
                "totalCount": 0,
            },
        )
        current["totalCount"] += 1
        if answers.get(question.id) == question.correct_answer:
            current["correctCount"] += 1
    return sorted(summary.values(), key=lambda item: item["topicTitle"])


def create_certificate_serial() -> str:
    date_part = datetime.now().strftime("%Y%m%d")
    random_part = random.randint(1000, 9999)
    return f"LTT-{date_part}-{random_part}"


def get_achievement_meta(score: int) -> dict[str, str]:
    if score >= 95:
        return {"title": "A'lo daraja", "message": "Material yuqori darajada o'zlashtirilgan.", "accent": "emerald"}
    if score >= 90:
        return {"title": "Zo'r natija", "message": "Bilim darajasi juda kuchli.", "accent": "sky"}
    if score >= 80:
        return {"title": "Yaxshi natija", "message": "Natija barqaror va ishonchli.", "accent": "amber"}
    if score >= 70:
        return {"title": "Barqaror daraja", "message": "Asosiy bilim shakllangan.", "accent": "violet"}
    return {"title": "Natija qayd etildi", "message": "Bilimni yana mustahkamlash tavsiya etiladi.", "accent": "rose"}


def pick_random_questions(questions: list[QuizQuestion], count: int) -> list[QuizQuestion]:
    pool = list(questions)
    random.shuffle(pool)
    return pool[: min(count, len(pool))]
