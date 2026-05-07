from fastapi import APIRouter, Depends, status, HTTPException
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

