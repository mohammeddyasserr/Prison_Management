import asyncio
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import text
from database import create_db_and_tables, engine
from routers import prison
from routers import block
from routers import cell
from routers import staff
from routers import incidents
from routers import disciplinary
from routers import visit
from routers import transfer
from routers import inmate
from routers import legal_case
from routers import shift
from routers import pending_inmate
from routers import doctor
from routers import medical_visit
from routers import authentication
from routers import overcrowding
import models
from schemas.visit import TimeslotCreate


def _deactivate_inmate_records(conn, inmate_id: int) -> None:
    conn.execute(text("""
        DELETE FROM transfer
        WHERE inmate_id = :inmate_id AND status = 'Pending'
    """), {"inmate_id": inmate_id})
    conn.execute(text("""
        DELETE FROM incident_involvement
        WHERE inmate_id = :inmate_id
    """), {"inmate_id": inmate_id})
    conn.execute(text("""
        DELETE FROM disciplinary_log
        WHERE inmate_id = :inmate_id
          AND date(date_imposed, '+' || COALESCE(duration_days, 0) || ' days') >= date('now')
    """), {"inmate_id": inmate_id})


def update_released_status():
    with engine.connect() as conn:
        # Ensure pending_inmate table exists
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS pending_inmate (
                pending_inmate_id       INTEGER         PRIMARY KEY,
                national_id             VARCHAR(14)     NOT NULL UNIQUE,
                full_name               VARCHAR(100)    NOT NULL,
                date_of_birth           DATE            NOT NULL,
                gender                  VARCHAR(10)     NOT NULL CHECK (gender IN ('Male','Female','Other')),
                nationality             VARCHAR(80)     NOT NULL,
                occupation              VARCHAR(100),
                start_date              DATE            NOT NULL,
                education_level         VARCHAR(50)     NOT NULL CHECK (education_level IN ('Illiterate','Literate', 'Primary','Preparatory', 'Secondary', 'Bachelor''s','Postgraduate education')),
                assigned_prison         INTEGER         REFERENCES prison(prison_id) ON DELETE SET NULL,
                status                  VARCHAR(20)     DEFAULT 'Active'
            )
        """))
        conn.commit()
        result = conn.execute(text("""
            SELECT inmate_id FROM inmate
            WHERE status != 'Released'
              AND date(
                start_date,
                '+' || COALESCE((SELECT SUM(sentence_duration_years) FROM legal_case WHERE inmate_id = inmate.inmate_id), 0) || ' years',
                '+' || COALESCE((SELECT SUM(sentence_duration_months) FROM legal_case WHERE inmate_id = inmate.inmate_id), 0) || ' months',
                '+' || COALESCE((SELECT SUM(sentence_duration_days) FROM legal_case WHERE inmate_id = inmate.inmate_id), 0) || ' days'
              ) < date('now')
        """))
        released_ids = [row[0] for row in result.fetchall()]

        result2 = conn.execute(text("""
            SELECT pending_inmate_id FROM pending_inmate
            WHERE status != 'Released'
              AND date(
                start_date,
                '+' || COALESCE((SELECT SUM(sentence_duration_years) FROM legal_case WHERE inmate_id = pending_inmate.pending_inmate_id), 0) || ' years',
                '+' || COALESCE((SELECT SUM(sentence_duration_months) FROM legal_case WHERE inmate_id = pending_inmate.pending_inmate_id), 0) || ' months',
                '+' || COALESCE((SELECT SUM(sentence_duration_days) FROM legal_case WHERE inmate_id = pending_inmate.pending_inmate_id), 0) || ' days'
              ) < date('now')
        """))
        released_pending_ids = [row[0] for row in result2.fetchall()]

        for iid in released_ids:
            _deactivate_inmate_records(conn, iid)
            conn.execute(text("UPDATE inmate SET status = 'Released', assigned_cell = NULL, assigned_prison = NULL WHERE inmate_id = :id"), {"id": iid})

        for iid in released_pending_ids:
            _deactivate_inmate_records(conn, iid)
            conn.execute(text("UPDATE pending_inmate SET status = 'Released', assigned_prison = NULL WHERE pending_inmate_id = :id"), {"id": iid})

        conn.commit()


async def release_checker():
    while True:
        try:
            update_released_status()
        except Exception:
            pass
        await asyncio.sleep(3600)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    update_released_status()
    task = asyncio.create_task(release_checker())
    yield
    task.cancel()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prison.router)
app.include_router(block.router)
app.include_router(cell.router)
app.include_router(staff.router)
app.include_router(inmate.router)
app.include_router(legal_case.router)
app.include_router(shift.router)
app.include_router(pending_inmate.router)
app.include_router(doctor.router)
app.include_router(medical_visit.router)
app.include_router(visit.router)
app.include_router(transfer.router)
app.include_router(incidents.router)
app.include_router(disciplinary.router)
app.include_router(authentication.router)
app.include_router(overcrowding.router)