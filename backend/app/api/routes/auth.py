from __future__ import annotations

from secrets import token_urlsafe

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.entities import User, utc_now
from app.schemas.auth import GoogleAuthRequest, LoginRequest, RegisterRequest
from app.services.google_auth import verify_firebase_id_token
from app.services.serializers import serialize_user

router = APIRouter()


def split_display_name(display_name: str) -> tuple[str, str]:
    parts = [part for part in display_name.strip().split() if part]
    if not parts:
        return "Google", "User"
    return parts[0], " ".join(parts[1:]) or "User"


def ensure_active_user(user: User) -> None:
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akkaunt bloklangan.")


def build_auth_response(user: User, extra_user_payload: dict | None = None) -> dict:
    serialized_user = serialize_user(user)
    if extra_user_payload:
        serialized_user.update(extra_user_payload)

    return {
        "accessToken": create_access_token(user.id, user.email, list(user.roles or [])),
        "tokenType": "bearer",
        "user": serialized_user,
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    email = payload.email.strip().lower()
    if db.scalar(select(User).where(User.email == email)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu email bilan akkaunt mavjud.")

    user = User(
        first_name=payload.firstName,
        last_name=payload.lastName,
        email=email,
        password_hash=hash_password(payload.password),
        roles=["user"],
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return build_auth_response(user)


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    email = payload.email.strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email yoki parol noto'g'ri.")
    ensure_active_user(user)

    user.last_login_at = utc_now()
    db.add(user)
    db.commit()
    db.refresh(user)

    return build_auth_response(user)


@router.post("/google")
def google_login(payload: GoogleAuthRequest, db: Session = Depends(get_db)) -> dict:
    google_user = verify_firebase_id_token(payload.idToken)
    email = google_user["email"]
    user = db.scalar(select(User).where(User.email == email))

    if user is None:
        first_name, last_name = split_display_name(google_user.get("name", ""))
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=hash_password(token_urlsafe(32)),
            roles=["user"],
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        ensure_active_user(user)

    user.last_login_at = utc_now()
    db.add(user)
    db.commit()
    db.refresh(user)

    extra_user_payload = {"avatarUrl": google_user.get("picture", "")}
    return build_auth_response(user, extra_user_payload=extra_user_payload)


@router.get("/me")
def me(current_user: User = Depends(get_current_user)) -> dict:
    return serialize_user(current_user)
