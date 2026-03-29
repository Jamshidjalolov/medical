from fastapi import APIRouter

from app.api.routes import admin, auth, certificates, progress, topics

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(topics.router, prefix="/topics", tags=["Topics"])
api_router.include_router(progress.router, prefix="/progress", tags=["Progress"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["Certificates"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
