from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import text
from datetime import date
import schemas
from database import SessionDep

router = APIRouter(
    prefix="/shift",
    tags=["shift"]
)

_BASE_SELECT = """
    SELECT
        s.*,
        o.name as officer_name,
        p.name as prison_name,
        CASE s.shift_type
            WHEN 'Morning' THEN '06:00 - 14:00'
            WHEN 'Afternoon' THEN '14:00 - 22:00'
            WHEN 'Night' THEN '22:00 - 06:00'
            ELSE 'Unknown'
        END as time_range
    FROM Shift s
    LEFT JOIN officer o ON s.officer_id = o.national_id
    LEFT JOIN block b ON s.block_id = b.block_id
    LEFT JOIN prison p ON b.prison_id = p.prison_id
"""


@router.get("", response_model=list[schemas.ShiftResponse], status_code=status.HTTP_200_OK)
def get_all(db: SessionDep):
    shifts = db.execute(text(_BASE_SELECT)).fetchall()
    return [dict(row._mapping) for row in shifts]


@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.ShiftResponse)
def create_shift(request: schemas.ShiftCreate, db: SessionDep):
    shift_data = request.model_dump()
    if isinstance(shift_data.get('date'), date):
        shift_data['date'] = shift_data['date'].isoformat()

    # If a manager is creating the shift, validate officer and block belong to the same prison
    if shift_data.get("manager_id"):
        officer = db.execute(text(
            "SELECT prison_id FROM officer WHERE national_id = :officer_id"
        ), {"officer_id": shift_data["officer_id"]}).fetchone()
        if not officer:
            raise HTTPException(status_code=400, detail="Officer not found")

        block = db.execute(text(
            "SELECT prison_id FROM block WHERE block_id = :block_id"
        ), {"block_id": shift_data["block_id"]}).fetchone()
        if not block:
            raise HTTPException(status_code=400, detail="Block not found")

        if officer[0] != block[0]:
            raise HTTPException(status_code=400, detail="Officer and block must belong to the same prison")

    try:
        result = db.execute(text("""
            INSERT INTO Shift (shift_type, officer_id, manager_id, block_id, date)
            VALUES (:shift_type, :officer_id, :manager_id, :block_id, :date)
            RETURNING shift_id
        """), shift_data)
        row = result.fetchone()
        new_shift_id = row[0] if row else result.lastrowid
    except Exception:
        db.execute(text("""
            INSERT INTO Shift (shift_type, officer_id, manager_id, block_id, date)
            VALUES (:shift_type, :officer_id, :manager_id, :block_id, :date)
        """), shift_data)
        new_shift_id = result.lastrowid

    db.commit()

    full_shift = db.execute(text(f"""
        {_BASE_SELECT}
        WHERE s.shift_id = :shift_id
    """), {"shift_id": new_shift_id}).fetchone()

    return dict(full_shift._mapping)


@router.get("/block/{block_id}", response_model=list[schemas.ShiftResponse], status_code=status.HTTP_200_OK)
def get_shifts_by_block(block_id: int, db: SessionDep):
    shifts = db.execute(text(f"""
        {_BASE_SELECT}
        WHERE s.block_id = :block_id
    """), {"block_id": block_id}).fetchall()
    return [dict(row._mapping) for row in shifts]


@router.get("/prison/{prison_id}", response_model=list[schemas.ShiftResponse], status_code=status.HTTP_200_OK)
def get_shifts_by_prison(prison_id: int, db: SessionDep):
    shifts = db.execute(text(f"""
        {_BASE_SELECT}
        WHERE b.prison_id = :prison_id
    """), {"prison_id": prison_id}).fetchall()
    return [dict(row._mapping) for row in shifts]


@router.get("/officer/{officer_id}", response_model=list[schemas.ShiftResponse], status_code=status.HTTP_200_OK)
def get_shifts_by_officer(officer_id: str, db: SessionDep):
    shifts = db.execute(text(f"""
        {_BASE_SELECT}
        WHERE s.officer_id = :officer_id
    """), {"officer_id": officer_id}).fetchall()
    return [dict(row._mapping) for row in shifts]


@router.delete("/{shift_id}", response_model=schemas.ShiftResponse, status_code=status.HTTP_200_OK)
def delete_shift(shift_id: int, db: SessionDep):
    full_shift = db.execute(text(f"""
        {_BASE_SELECT}
        WHERE s.shift_id = :shift_id
    """), {"shift_id": shift_id}).fetchone()

    if not full_shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    shift_dict = dict(full_shift._mapping)

    db.execute(text("DELETE FROM Shift WHERE shift_id = :shift_id"), {"shift_id": shift_id})
    db.commit()

    return shift_dict
