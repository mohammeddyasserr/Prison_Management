import json
from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import text
import schemas
from database import SessionDep

router = APIRouter(
    prefix="/inmates",
    tags=["inmates"]
)


def _parse_row(row: dict) -> dict:
    if row.get("legal_cases"):
        parsed = json.loads(row["legal_cases"])
        row["legal_cases"] = [c for c in parsed if c.get("case_number") is not None]
    else:
        row["legal_cases"] = []
    return row


INMATE_COLS = """
    i.inmate_id,
    'inmate' as source,
    i.national_id,
    i.full_name,
    i.date_of_birth,
    i.gender,
    i.nationality,
    i.occupation,
    i.start_date,
    i.education_level,
    i.assigned_cell,
    b.block_id as block_id,
    i.assigned_prison,
    i.status as status,
    p.name as prison_name,
    date(i.start_date,
         '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years',
         '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months',
         '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date,
    json_group_array(
        json_object(
            'case_number', lc.case_number,
            'crime_type', lc.crime_type,
            'court_name', lc.court_name,
            'sentence_duration_years', lc.sentence_duration_years,
            'sentence_duration_months', lc.sentence_duration_months,
            'sentence_duration_days', lc.sentence_duration_days
        )
    ) as legal_cases
"""

PENDING_COLS = """
    pi.pending_inmate_id as inmate_id,
    'pending' as source,
    pi.national_id,
    pi.full_name,
    pi.date_of_birth,
    pi.gender,
    pi.nationality,
    pi.occupation,
    pi.start_date,
    pi.education_level,
    NULL as assigned_cell,
    NULL as block_id,
    pi.assigned_prison,
    pi.status as status,
    p.name as prison_name,
    date(pi.start_date,
         '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years',
         '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months',
         '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date,
    json_group_array(
        json_object(
            'case_number', lc.case_number,
            'crime_type', lc.crime_type,
            'court_name', lc.court_name,
            'sentence_duration_years', lc.sentence_duration_years,
            'sentence_duration_months', lc.sentence_duration_months,
            'sentence_duration_days', lc.sentence_duration_days
        )
    ) as legal_cases
"""


@router.get("", response_model=list[schemas.InmateResponse], status_code=status.HTTP_200_OK)
def get_all(db: SessionDep):
    inmates = db.execute(text(f"""
        SELECT * FROM (
            SELECT {INMATE_COLS}
            FROM inmate i
            LEFT JOIN cell c ON i.assigned_cell = c.cell_id
            LEFT JOIN block b ON c.block_id = b.block_id
            LEFT JOIN prison p ON b.prison_id = p.prison_id
            LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
            GROUP BY i.inmate_id

            UNION ALL

            SELECT {PENDING_COLS}
            FROM pending_inmate pi
            LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
            LEFT JOIN legal_case lc ON pi.pending_inmate_id = lc.inmate_id
            GROUP BY pi.pending_inmate_id
        )
        ORDER BY status = 'Released', inmate_id, full_name
    """)).fetchall()

    return [_parse_row(dict(row._mapping)) for row in inmates]


@router.get("/{inmate_id}", response_model=schemas.InmateResponse, status_code=status.HTTP_200_OK)
def get_inmate(inmate_id: int, db: SessionDep):
    result = db.execute(text(f"""
        SELECT * FROM (
            SELECT {INMATE_COLS}
            FROM inmate i
            LEFT JOIN cell c ON i.assigned_cell = c.cell_id
            LEFT JOIN block b ON c.block_id = b.block_id
            LEFT JOIN prison p ON b.prison_id = p.prison_id
            LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
            GROUP BY i.inmate_id

            UNION ALL

            SELECT {PENDING_COLS}
            FROM pending_inmate pi
            LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
            LEFT JOIN legal_case lc ON pi.pending_inmate_id = lc.inmate_id
            GROUP BY pi.pending_inmate_id
        )
        WHERE inmate_id = :inmate_id
    """), {"inmate_id": inmate_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Inmate not found")

    return _parse_row(dict(result._mapping))


@router.get("/national_id/{national_id}", response_model=schemas.InmateResponse, status_code=status.HTTP_200_OK)
def get_inmate_by_national_id(national_id: str, db: SessionDep):
    result = db.execute(text(f"""
        SELECT * FROM (
            SELECT {INMATE_COLS}
            FROM inmate i
            LEFT JOIN cell c ON i.assigned_cell = c.cell_id
            LEFT JOIN block b ON c.block_id = b.block_id
            LEFT JOIN prison p ON b.prison_id = p.prison_id
            LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
            WHERE i.national_id = :national_id
            GROUP BY i.inmate_id

            UNION ALL

            SELECT {PENDING_COLS}
            FROM pending_inmate pi
            LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
            LEFT JOIN legal_case lc ON pi.pending_inmate_id = lc.inmate_id
            WHERE pi.national_id = :national_id
            GROUP BY pi.pending_inmate_id
        )
        LIMIT 1
    """), {"national_id": national_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Inmate not found")

    return _parse_row(dict(result._mapping))


@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.PendingInmateResponse)
def create_inmate(request: schemas.PendingInmateCreate, db: SessionDep):
    inmate_data = request.model_dump()

    result = db.execute(text("""
        INSERT INTO pending_inmate (
            national_id, full_name, date_of_birth, gender, nationality,
            occupation, start_date, education_level, assigned_prison, status
        ) VALUES (
            :national_id, :full_name, :date_of_birth, :gender, :nationality,
            :occupation, :start_date, :education_level, :assigned_prison, :status
        ) RETURNING *
    """), inmate_data)

    inserted_pending_inmate = result.fetchone()
    pending_inmate_id = inserted_pending_inmate.pending_inmate_id

    new_result = db.execute(text("""
        SELECT
            pi.*,
            p.name as prison_name,
            '[]' as legal_cases
        FROM pending_inmate pi
        LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
        WHERE pi.pending_inmate_id = :pending_inmate_id
    """), {"pending_inmate_id": pending_inmate_id}).fetchone()

    new_pending_inmate = _parse_row(dict(new_result._mapping))
    db.commit()
    return new_pending_inmate


@router.put("/{inmate_id}/release", response_model=schemas.InmateResponse, status_code=status.HTTP_200_OK)
def release_inmate(inmate_id: int, db: SessionDep):
    result = db.execute(text(f"""
        SELECT {INMATE_COLS}
        FROM inmate i
        LEFT JOIN cell c ON i.assigned_cell = c.cell_id
        LEFT JOIN block b ON c.block_id = b.block_id
        LEFT JOIN prison p ON b.prison_id = p.prison_id
        LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
        WHERE i.inmate_id = :inmate_id
        GROUP BY i.inmate_id
    """), {"inmate_id": inmate_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Inmate not found")

    inmate_dict = _parse_row(dict(result._mapping))

    db.execute(text("UPDATE inmate SET status = 'Released' WHERE inmate_id = :inmate_id"), {"inmate_id": inmate_id})
    db.commit()

    inmate_dict["status"] = "Released"
    return inmate_dict


@router.get("/prison/{prison_id}", response_model=list[schemas.InmateResponse], status_code=status.HTTP_200_OK)
def get_inmates_by_prison(prison_id: int, db: SessionDep):
    inmates = db.execute(text(f"""
        SELECT * FROM (
            SELECT {INMATE_COLS}
            FROM inmate i
            LEFT JOIN cell c ON i.assigned_cell = c.cell_id
            LEFT JOIN block b ON c.block_id = b.block_id
            LEFT JOIN prison p ON b.prison_id = p.prison_id
            LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
            WHERE b.prison_id = :prison_id
            GROUP BY i.inmate_id

            UNION ALL

            SELECT {PENDING_COLS}
            FROM pending_inmate pi
            LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
            LEFT JOIN legal_case lc ON pi.pending_inmate_id = lc.inmate_id
            WHERE pi.assigned_prison = :prison_id
            GROUP BY pi.pending_inmate_id
        )
        ORDER BY status = 'Released', inmate_id, full_name
    """), {"prison_id": prison_id}).fetchall()

    return [_parse_row(dict(row._mapping)) for row in inmates]


@router.get("/incident/{incident_id}", response_model=list[schemas.InmateResponse], status_code=status.HTTP_200_OK)
def get_inmates_by_incident(incident_id: int, db: SessionDep):
    inmates = db.execute(text(f"""
        SELECT
            i.*,
            i.status as status,
            b.block_id as block_id,
            p.name as prison_name,
            date(i.start_date,
                 '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years',
                 '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months',
                 '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date,
            json_group_array(
                json_object(
                    'case_number', lc.case_number,
                    'crime_type', lc.crime_type,
                    'court_name', lc.court_name,
                    'sentence_duration_years', lc.sentence_duration_years,
                    'sentence_duration_months', lc.sentence_duration_months,
                    'sentence_duration_days', lc.sentence_duration_days
                )
            ) as legal_cases
        FROM inmate i
        LEFT JOIN cell c ON i.assigned_cell = c.cell_id
        LEFT JOIN block b ON c.block_id = b.block_id
        LEFT JOIN prison p ON b.prison_id = p.prison_id
        LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
        WHERE i.inmate_id IN (
            SELECT inmate_id FROM incident_involvement WHERE incident_id = :incident_id
        )
        GROUP BY i.inmate_id
    """), {"incident_id": incident_id}).fetchall()

    return [_parse_row(dict(row._mapping)) for row in inmates]


@router.get("/manager/{manager_national_id}", response_model=list[schemas.InmateResponse], status_code=status.HTTP_200_OK)
def get_inmates_by_manager(manager_national_id: str, db: SessionDep):
    prison_result = db.execute(text("""
        SELECT prison_id FROM prison WHERE manager_id = :manager_national_id
    """), {"manager_national_id": manager_national_id}).fetchone()

    if not prison_result:
        raise HTTPException(status_code=404, detail="Manager not found or not assigned to a prison")

    prison_id = prison_result[0]

    inmates = db.execute(text(f"""
        SELECT * FROM (
            SELECT {INMATE_COLS}
            FROM inmate i
            LEFT JOIN cell c ON i.assigned_cell = c.cell_id
            LEFT JOIN block b ON c.block_id = b.block_id
            LEFT JOIN prison p ON b.prison_id = p.prison_id
            LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
            WHERE b.prison_id = :prison_id
            GROUP BY i.inmate_id

            UNION ALL

            SELECT {PENDING_COLS}
            FROM pending_inmate pi
            LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
            LEFT JOIN legal_case lc ON pi.pending_inmate_id = lc.inmate_id
            WHERE pi.assigned_prison = :prison_id
            GROUP BY pi.pending_inmate_id
        )
        ORDER BY status = 'Released', inmate_id, full_name
    """), {"prison_id": prison_id}).fetchall()

    return [_parse_row(dict(row._mapping)) for row in inmates]
