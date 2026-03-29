from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import BACKEND_DIR, settings
from app.db.session import SessionLocal, create_tables
from app.services.seeding import seed_all

UPLOADS_DIR = BACKEND_DIR / "uploads"


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.auto_create_tables:
        create_tables()

    if settings.seed_on_startup:
        with SessionLocal() as db:
            seed_all(db)

    yield


app = FastAPI(title=settings.project_name, debug=settings.debug, lifespan=lifespan)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/")
def root() -> dict:
    return {"name": settings.project_name, "docs": "/docs", "apiPrefix": settings.api_v1_prefix}


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
