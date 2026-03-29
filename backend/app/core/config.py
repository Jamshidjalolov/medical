from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_env: str = "development"
    project_name: str = "Lotin tili va tibbiy terminologiya API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/latin_med_terms"
    database_pool_size: int = 10
    database_max_overflow: int = 20
    database_pool_recycle_seconds: int = 1800
    jwt_secret_key: str = "change-this-secret-key"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    backend_cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"])
    default_admin_email: str = "admin@talimtest.uz"
    default_admin_password: str = "Admin2026!"
    topic_passing_score: int = 70
    certificate_question_count: int = 50
    certificate_passing_score: int = 70
    firebase_project_id: str = ""
    google_certs_timeout_seconds: int = 5
    upload_max_bytes: int = 5 * 1024 * 1024
    auto_create_tables: bool = True
    seed_on_startup: bool = True
    debug: bool = True

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("app_env", mode="before")
    @classmethod
    def normalize_app_env(cls, value: str) -> str:
        return str(value or "development").strip().lower()

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        normalized = str(value or "").strip()
        if normalized.startswith("postgres://"):
            return f"postgresql+psycopg://{normalized[len('postgres://') :]}"
        if normalized.startswith("postgresql://"):
            return f"postgresql+psycopg://{normalized[len('postgresql://') :]}"
        return normalized

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            normalized = value.strip()
            if not normalized:
                return []
            if normalized.startswith("["):
                parsed = json.loads(normalized)
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]
            return [item.strip() for item in normalized.split(",") if item.strip()]
        return value

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value: bool | str) -> bool | str:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on", "debug", "development", "dev"}:
                return True
            if normalized in {"0", "false", "no", "off", "release", "production", "prod"}:
                return False
        return value

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.app_env != "production":
            return self

        issues: list[str] = []
        if self.debug:
            issues.append("DEBUG productionda false bo'lishi kerak.")
        if self.jwt_secret_key == "change-this-secret-key":
            issues.append("JWT_SECRET_KEY production uchun almashtirilishi kerak.")
        if self.auto_create_tables:
            issues.append("AUTO_CREATE_TABLES productionda false bo'lishi kerak.")
        if self.seed_on_startup:
            issues.append("SEED_ON_STARTUP productionda false bo'lishi kerak.")

        if issues:
            raise ValueError(" ".join(issues))

        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
