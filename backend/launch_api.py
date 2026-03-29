from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

backend_root = Path(__file__).resolve().parent
venv_python = backend_root / ".venv" / "Scripts" / "python.exe"

os.chdir(backend_root)
os.environ.setdefault("DEBUG", "true")
os.environ.setdefault("PYTHONPATH", str(backend_root))

if "BACKEND_CORS_ORIGINS" not in os.environ:
    os.environ["BACKEND_CORS_ORIGINS"] = '["http://localhost:5173","http://127.0.0.1:5173"]'

if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "postgresql+psycopg://postgres:jamshid4884@localhost:5432/latin_med_terms"

port = os.environ.get("API_PORT", "8000")
python_executable = str(venv_python) if venv_python.exists() else sys.executable

raise SystemExit(
    subprocess.call(
        [
            python_executable,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "127.0.0.1",
            "--port",
            str(port),
        ]
    )
)
