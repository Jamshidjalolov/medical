from __future__ import annotations

from datetime import datetime

from app.models.entities import Certificate, CertificateExamAttempt, LearningItem, QuizQuestion, Topic, TopicQuizAttempt, User


def to_iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def serialize_learning_item(item: LearningItem) -> dict:
    return {
        "id": item.id,
        "topicId": item.topic_id,
        "title": item.title,
        "description": item.description,
        "quizQuestion": item.quiz_question,
        "image": item.image,
        "fallbackImage": item.fallback_image,
        "sortOrder": item.sort_order,
    }


def serialize_question(question: QuizQuestion, include_answer: bool = False) -> dict:
    payload = {
        "id": question.id,
        "topicId": question.topic_id,
        "topicTitle": question.topic.title if question.topic else None,
        "learningItemId": question.learning_item_id,
        "question": question.question,
        "options": list(question.options or []),
        "sortOrder": question.sort_order,
    }
    if include_answer:
        payload["correctAnswer"] = question.correct_answer
    return payload


def serialize_topic(topic: Topic, include_relations: bool = False, include_answers: bool = False) -> dict:
    learn_items = sorted(topic.learn_items, key=lambda item: item.sort_order)
    quiz_questions = sorted(topic.quiz_questions, key=lambda item: item.sort_order)
    payload = {
        "id": topic.id,
        "title": topic.title,
        "description": topic.description,
        "glyph": topic.glyph,
        "palette": topic.palette or {},
        "image": topic.image,
        "fallbackImage": topic.fallback_image,
        "sortOrder": topic.sort_order,
        "isPublished": topic.is_published,
        "learnItemCount": len(learn_items),
        "quizQuestionCount": len(quiz_questions),
    }
    if include_relations:
        payload["learnItems"] = [serialize_learning_item(item) for item in learn_items]
        payload["quizQuestions"] = [serialize_question(question, include_answer=include_answers) for question in quiz_questions]
    return payload


def serialize_user(user: User, include_stats: bool = False) -> dict:
    payload = {
        "id": user.id,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "fullName": f"{user.first_name} {user.last_name}".strip(),
        "email": user.email,
        "roles": list(user.roles or []),
        "registeredAt": to_iso(user.registered_at),
        "lastLoginAt": to_iso(user.last_login_at),
        "isActive": user.is_active,
    }
    if include_stats:
        reviewed_topic_count = len({entry.topic_id for entry in user.learning_entries})
        completed_topic_count = len({attempt.topic_id for attempt in user.topic_quiz_attempts if attempt.passed})
        payload["reviewedItemCount"] = len(user.learning_entries)
        payload["reviewedTopicCount"] = reviewed_topic_count
        payload["topicQuizCount"] = len(user.topic_quiz_attempts)
        payload["completedTopicCount"] = completed_topic_count
        payload["certificateCount"] = len(user.certificates)
    return payload


def serialize_topic_attempt(attempt: TopicQuizAttempt) -> dict:
    return {
        "id": attempt.id,
        "topicId": attempt.topic_id,
        "topicTitle": attempt.topic.title if attempt.topic else None,
        "answers": attempt.answers or {},
        "score": attempt.score,
        "total": attempt.total,
        "correctCount": attempt.correct_count,
        "wrongCount": attempt.wrong_count,
        "threshold": attempt.threshold,
        "passed": attempt.passed,
        "completedAt": to_iso(attempt.completed_at),
    }


def serialize_exam_attempt(attempt: CertificateExamAttempt) -> dict:
    return {
        "id": attempt.id,
        "questionIds": list(attempt.question_ids or []),
        "answers": attempt.answers or {},
        "score": attempt.score,
        "total": attempt.total,
        "correctCount": attempt.correct_count,
        "wrongCount": attempt.wrong_count,
        "threshold": attempt.threshold,
        "passed": attempt.passed,
        "breakdown": list(attempt.breakdown or []),
        "completedAt": to_iso(attempt.completed_at),
    }


def serialize_certificate(certificate: Certificate) -> dict:
    return {
        "id": certificate.id,
        "userId": certificate.user_id,
        "attemptId": certificate.exam_attempt_id,
        "serialNumber": certificate.serial_number,
        "fullName": certificate.full_name,
        "score": certificate.score,
        "total": certificate.total,
        "correctCount": certificate.correct_count,
        "wrongCount": certificate.wrong_count,
        "issueDate": to_iso(certificate.issue_date),
        "achievement": certificate.achievement or {},
        "breakdown": list(certificate.breakdown or []),
    }
