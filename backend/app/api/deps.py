from __future__ import annotations

from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_token
from app.db.session import get_db
from app.models.entities import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login")


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token noto'g'ri.")

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Foydalanuvchi topilmadi.")

    return user


def require_roles(*roles: str) -> Callable:
    required = {role.strip().lower() for role in roles}

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        user_roles = {role.strip().lower() for role in current_user.roles or []}
        if required and not user_roles.intersection(required):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu amal uchun ruxsat yo'q.")
        return current_user

    return dependency
