# Backend

FastAPI + SQLAlchemy + JWT + PostgreSQL backend for `Lotin tili va tibbiy terminologiya`.

## Stack

- FastAPI
- SQLAlchemy 2.x
- PostgreSQL
- JWT auth
- Firebase Google sign-in verification
- Alembic
- Docker Compose

## Structure

```text
backend/
  app/
    api/
    core/
    db/
    models/
    schemas/
    services/
    seed/
  alembic/
  scripts/
  Dockerfile
  docker-compose.yml
```

## Local setup

1. Create env file:

```bash
copy .env.example .env
```

`BACKEND_CORS_ORIGINS` JSON list ko'rinishida turadi.
Google login ishlashi uchun `FIREBASE_PROJECT_ID` ham to'ldiriladi.

2. Create virtualenv:

```bash
py -m venv .venv
```

3. Activate and install:

```bash
.venv\Scripts\activate
pip install -r requirements.txt
```

4. Start PostgreSQL:

```bash
docker compose up -d postgres
```

5. Export current frontend topics into backend seed:

```bash
node scripts/export_topics.mjs
```

6. Run API:

```bash
python launch_api.py
```

`launch_api.py`, `run_api.ps1`, and `run_api.cmd` prefer `backend\.venv\Scripts\python.exe` when it exists.

Docs:

- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/redoc`

## Docker

```bash
docker compose up --build
```

## Production

1. `copy .env.production.example .env`
2. `JWT_SECRET_KEY`, `DEFAULT_ADMIN_PASSWORD`, `DATABASE_URL`, `BACKEND_CORS_ORIGINS`, `FIREBASE_PROJECT_ID` qiymatlarini almashtiring.
3. `AUTO_CREATE_TABLES=false`, `SEED_ON_STARTUP=false`, `DEBUG=false` holatda qoldiring.
4. Production compose kerak bo'lsa:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## Render

Repo root'ida `render.yaml` tayyor. U quyidagini yaratadi:

- Docker-based web service
- Render Postgres database
- `/app/uploads` uchun persistent disk
- `/health` health check

Muhim:

- Web service `starter` plan tanlangan, chunki uploadlar persistent disk talab qiladi.
- Database `basic-256mb` plan tanlangan.
- Render Postgres `postgres://...` URL qaytarsa ham app uni avtomatik `postgresql+psycopg://...` formatiga moslaydi.

Render deploy:

1. GitHub repo'ni Render'ga ulang.
2. `New +` -> `Blueprint` ni tanlang.
3. Root'dagi `render.yaml` ni deploy qiling.
4. Render so'raydigan secret/env qiymatlarni kiriting:
   - `BACKEND_CORS_ORIGINS`
   - `DEFAULT_ADMIN_EMAIL`
   - `DEFAULT_ADMIN_PASSWORD`
   - `FIREBASE_PROJECT_ID`
5. Birinchi deploy tugagach, web service shell yoki one-off command orqali bazani init qiling:

```bash
python scripts/bootstrap_db.py
```

6. `bootstrap-ok` chiqqach, API tayyor bo'ladi.

`BACKEND_CORS_ORIGINS` qiymati misol:

```text
["https://your-project.vercel.app","https://your-custom-domain.com"]
```

## Notes

- On first startup, tables can be auto-created and initial topics/admin user are seeded.
- Default admin credentials come from `.env`.
- Default PostgreSQL password in this setup: `jamshid4884`
- Google login frontend Firebase popup orqali boshlanadi, backend esa Firebase ID tokenni tekshirib local JWT beradi.
- Upload fayllar lokal `backend/uploads/` ichida saqlanadi; productionda object storage ishlatish yaxshiroq.
