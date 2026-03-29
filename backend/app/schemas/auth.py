from __future__ import annotations

from pydantic import EmailStr, Field, field_validator

from app.schemas.common import StrictModel


class RegisterRequest(StrictModel):
    firstName: str = Field(min_length=1, max_length=120)
    lastName: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

    @field_validator("firstName", "lastName", "password", mode="before")
    @classmethod
    def strip_strings(cls, value: str) -> str:
        return value.strip()


class LoginRequest(StrictModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("password", mode="before")
    @classmethod
    def strip_password(cls, value: str) -> str:
        return value.strip()


class GoogleAuthRequest(StrictModel):
    idToken: str = Field(min_length=1)

    @field_validator("idToken", mode="before")
    @classmethod
    def strip_id_token(cls, value: str) -> str:
        return value.strip()
