from __future__ import annotations

from app.db.session import SessionLocal, create_tables
from app.services.seeding import seed_all


def main() -> None:
    create_tables()
    with SessionLocal() as db:
        seed_all(db)
    print("bootstrap-ok")


if __name__ == "__main__":
    main()
