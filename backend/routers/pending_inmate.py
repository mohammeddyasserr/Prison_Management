from fastapi import APIRouter, Depends, status, HTTPException, Form
from sqlmodel import text
import schemas
from database import SessionDep

router = APIRouter(
    prefix="/pending_inmates",
    tags=["pending_inmates"]
)

@router.get("", response_model=list[schemas.PendingInmateResponse], status_code=status.HTTP_200_OK)
def get_all(db: SessionDep):
    pending_inmates = db.execute(text("""
        SELECT 
            pi.*,
            p.name as prison_name,
            date(pi.start_date, 
                 '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                 '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                 '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date
        FROM pending_inmate pi
        LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
        LEFT JOIN legal_case lc ON pi.pending_inmate_id = lc.inmate_id
        GROUP BY pi.pending_inmate_id
        ORDER BY pi.pending_inmate_id, pi.full_name
    """)).fetchall()
    
    return [dict(row._mapping) for row in pending_inmates]

@router.get("/{pending_inmate_id}", response_model=schemas.PendingInmateResponse, status_code=status.HTTP_200_OK)
def get_pending_inmate(pending_inmate_id: int, db: SessionDep):
    result = db.execute(text("""
        SELECT 
            pi.*,
            p.name as prison_name,
            date(pi.start_date, 
                 '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                 '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                 '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date
        FROM pending_inmate pi
        LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
        LEFT JOIN legal_case lc ON pi.pending_inmate_id = lc.inmate_id
        WHERE pi.pending_inmate_id = :pending_inmate_id
        GROUP BY pi.pending_inmate_id
    """), {"pending_inmate_id": pending_inmate_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Pending inmate not found")

    return dict(result._mapping)

@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.PendingInmateResponse)
def create_pending_inmate(request: schemas.PendingInmateCreate, db: SessionDep):
    pending_inmate_data = request.model_dump()
    
    result = db.execute(text("""
        INSERT INTO pending_inmate (
            national_id, full_name, date_of_birth, gender, nationality, 
            occupation, start_date, education_level, assigned_prison, status
        ) VALUES (
            :national_id, :full_name, :date_of_birth, :gender, :nationality, 
            :occupation, :start_date, :education_level, :assigned_prison, :status
        ) RETURNING *
    """), pending_inmate_data)
    
    inserted_pending_inmate = result.fetchone()
    pending_inmate_id = inserted_pending_inmate.pending_inmate_id
    
    # Fetch the full data with joins to return consistent response
    new_result = db.execute(text("""
        SELECT 
            pi.*,
            p.name as prison_name,
            date(pi.start_date, 
                 '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                 '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                 '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date
        FROM pending_inmate pi
        LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
        LEFT JOIN legal_case lc ON pi.pending_inmate_id = lc.inmate_id
        WHERE pi.pending_inmate_id = :pending_inmate_id
        GROUP BY pi.pending_inmate_id
    """), {"pending_inmate_id": pending_inmate_id}).fetchone()
    
    new_pending_inmate = dict(new_result._mapping)
    db.commit()
    return new_pending_inmate

@router.delete("/{pending_inmate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pending_inmate(pending_inmate_id: int, db: SessionDep):
    result = db.execute(text("SELECT 1 FROM pending_inmate WHERE pending_inmate_id = :pending_inmate_id"), {"pending_inmate_id": pending_inmate_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Pending inmate not found")
        
    db.execute(text("DELETE FROM pending_inmate WHERE pending_inmate_id = :pending_inmate_id"), {"pending_inmate_id": pending_inmate_id})
    db.commit()
    return None


@router.post("/{pending_inmate_id}/assign", response_model=schemas.InmateResponse, status_code=status.HTTP_200_OK)
def assign_pending_inmate_to_cell(
    pending_inmate_id: int,
    db: SessionDep,
    cell_id: int = Form(...),
):
    # NOTE: Using form fields because frontend posts x-www-form-urlencoded.
    pending = db.execute(text("""
        SELECT *
        FROM pending_inmate
        WHERE pending_inmate_id = :pending_inmate_id
    """), {"pending_inmate_id": pending_inmate_id}).fetchone()

    if not pending:
        raise HTTPException(status_code=404, detail="Pending inmate not found")

    pending_dict = dict(pending._mapping)
    prison_id = pending_dict.get("assigned_prison")
    if prison_id is None:
        raise HTTPException(status_code=400, detail="Pending inmate has no assigned prison")

    # Validate the cell belongs to the same prison
    cell_row = db.execute(text("""
        SELECT c.cell_id, c.capacity, c.block_id, b.prison_id
        FROM cell c
        JOIN block b ON c.block_id = b.block_id
        WHERE c.cell_id = :cell_id
    """), {"cell_id": cell_id}).fetchone()

    if not cell_row:
        raise HTTPException(status_code=404, detail="Cell not found")

    cell = dict(cell_row._mapping)
    if int(cell["prison_id"]) != int(prison_id):
        raise HTTPException(status_code=400, detail="Selected cell is not in the inmate's assigned prison")

    occupancy = db.execute(text("""
        SELECT COUNT(*) AS occupancy
        FROM inmate
        WHERE assigned_cell = :cell_id
    """), {"cell_id": cell_id}).fetchone()[0]

    if occupancy >= int(cell["capacity"]):
        raise HTTPException(status_code=400, detail="Selected cell is full")

    # Move record: insert into inmate (keep same id), then delete pending
    db.execute(text("""
        INSERT INTO inmate (
            inmate_id, national_id, full_name, date_of_birth, gender, nationality,
            occupation, start_date, education_level, assigned_cell, assigned_prison, status
        ) VALUES (
            :inmate_id, :national_id, :full_name, :date_of_birth, :gender, :nationality,
            :occupation, :start_date, :education_level, :assigned_cell, :assigned_prison, :status
        )
    """), {
        "inmate_id": pending_inmate_id,
        "national_id": pending_dict["national_id"],
        "full_name": pending_dict["full_name"],
        "date_of_birth": pending_dict["date_of_birth"],
        "gender": pending_dict["gender"],
        "nationality": pending_dict["nationality"],
        "occupation": pending_dict.get("occupation"),
        "start_date": pending_dict["start_date"],
        "education_level": pending_dict["education_level"],
        "assigned_cell": cell_id,
        "assigned_prison": prison_id,
        "status": pending_dict.get("status") or "Active",
    })

    db.execute(text("""
        DELETE FROM pending_inmate
        WHERE pending_inmate_id = :pending_inmate_id
    """), {"pending_inmate_id": pending_inmate_id})

    db.commit()

    # Return consistent response with prison_name + release_date
    inserted = db.execute(text("""
        SELECT 
            i.*,
            b.block_id as block_id,
            p.name as prison_name,
            date(i.start_date, 
                 '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                 '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                 '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date
        FROM inmate i
        LEFT JOIN cell c ON i.assigned_cell = c.cell_id
        LEFT JOIN block b ON c.block_id = b.block_id
        LEFT JOIN prison p ON b.prison_id = p.prison_id
        LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
        WHERE i.inmate_id = :inmate_id
        GROUP BY i.inmate_id
    """), {"inmate_id": pending_inmate_id}).fetchone()

    return dict(inserted._mapping) if inserted else None

