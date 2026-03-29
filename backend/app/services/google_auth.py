from __future__ import annotations

import json
import re
import time
from urllib.request import Request, urlopen

import jwt
from cryptography.x509 import load_pem_x509_certificate
from fastapi import HTTPException, status
from jwt import InvalidKeyError, InvalidTokenError

from app.core.config import settings

FIREBASE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
_cert_cache: dict[str, float | dict[str, str]] = {"expires_at": 0.0, "certs": {}}


def _read_cache_max_age(cache_control: str) -> int:
    match = re.search(r"max-age=(\d+)", cache_control or "")
    if not match:
        return 3600
    return max(int(match.group(1)), 60)


def _fetch_google_certs() -> tuple[dict[str, str], int]:
    request = Request(FIREBASE_CERTS_URL, headers={"Accept": "application/json"})

    try:
        with urlopen(request, timeout=settings.google_certs_timeout_seconds) as response:
            payload = json.loads(response.read().decode("utf-8"))
            cache_control = response.headers.get("Cache-Control", "")
    except Exception as exc:  # pragma: no cover - network/runtime protection
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google tokenlarini tekshirish xizmatiga ulanib bo'lmadi. Serverdan https://www.googleapis.com ga chiqish kerak.",
        ) from exc

    if not isinstance(payload, dict) or not payload:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google token sertifikatlari bo'sh qaytdi.",
        )

    return {str(key): str(value) for key, value in payload.items()}, _read_cache_max_age(cache_control)


def get_google_certs(force_refresh: bool = False) -> dict[str, str]:
    now = time.time()
    cached_certs = _cert_cache.get("certs")
    expires_at = float(_cert_cache.get("expires_at") or 0)

    if not force_refresh and isinstance(cached_certs, dict) and cached_certs and now < expires_at:
        return cached_certs

    certs, max_age = _fetch_google_certs()
    _cert_cache["certs"] = certs
    _cert_cache["expires_at"] = now + max(60, max_age - 30)
    return certs


def certificate_to_public_key(certificate: str):
    try:
        return load_pem_x509_certificate(certificate.encode("utf-8")).public_key()
    except Exception as exc:  # pragma: no cover - malformed third-party cert protection
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google sertifikatini o'qib bo'lmadi. Keyinroq yana urinib ko'ring.",
        ) from exc


def verify_firebase_id_token(id_token: str) -> dict:
    project_id = settings.firebase_project_id.strip()
    if not project_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google/Firebase kirish serverda sozlanmagan.",
        )

    try:
        header = jwt.get_unverified_header(id_token)
    except InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google token noto'g'ri.") from exc

    if header.get("alg") != "RS256" or not header.get("kid"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google token noto'g'ri.")

    kid = str(header["kid"])
    certs = get_google_certs()
    certificate = certs.get(kid)
    if certificate is None:
        certs = get_google_certs(force_refresh=True)
        certificate = certs.get(kid)
    if certificate is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google token kaliti topilmadi.")

    issuer = f"https://securetoken.google.com/{project_id}"
    public_key = certificate_to_public_key(certificate)

    try:
        payload = jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=project_id,
            issuer=issuer,
        )
    except (InvalidTokenError, InvalidKeyError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token yaroqsiz yoki eskirgan.",
        ) from exc

    subject = str(payload.get("sub") or "").strip()
    email = str(payload.get("email") or "").strip().lower()
    if not subject or not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google akkaunt ma'lumoti to'liq emas.")

    if payload.get("email_verified") is False:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google akkaunt emaili tasdiqlanmagan.",
        )

    return {
        "uid": subject,
        "email": email,
        "name": str(payload.get("name") or "").strip(),
        "picture": str(payload.get("picture") or "").strip(),
        "emailVerified": bool(payload.get("email_verified", False)),
    }
