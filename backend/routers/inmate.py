from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import text
import schemas
from database import SessionDep

router = APIRouter(
    prefix="/inmates",
    tags=["inmates"]
)

@router.get("", response_model=list[schemas.InmateResponse], status_code=status.HTTP_200_OK)
def get_all(db: SessionDep):
    inmates = db.execute(text("""
        SELECT 
            i.*,
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
        GROUP BY i.inmate_id
    """)).fetchall()
    
    return [dict(row._mapping) for row in inmates]

@router.get("/{inmate_id}", response_model=schemas.InmateResponse, status_code=status.HTTP_200_OK)
def get_inmate(inmate_id: int, db: SessionDep):
    result = db.execute(text("""
        SELECT 
            i.*,
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
    """), {"inmate_id": inmate_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Inmate not found")

    return dict(result._mapping)

@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.InmateResponse)
def create_inmate(request: schemas.InmateCreate, db: SessionDep):
    inmate_data = request.model_dump()
    
    result = db.execute(text("""
        INSERT INTO inmate (
            national_id, full_name, date_of_birth, gender, nationality, 
            occupation, start_date, education_level, assigned_cell
        ) VALUES (
            :national_id, :full_name, :date_of_birth, :gender, :nationality, 
            :occupation, :start_date, :education_level, :assigned_cell
        ) RETURNING *
    """), inmate_data)
    
    inserted_inmate = result.fetchone()
    inmate_id = inserted_inmate.inmate_id
    
    # Fetch the full data with joins to return consistent response
    new_inmate_result = db.execute(text("""
        SELECT 
            i.*,
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
    """), {"inmate_id": inmate_id}).fetchone()
    
    new_inmate = dict(new_inmate_result._mapping)
    db.commit()
    return new_inmate

@router.delete("/{inmate_id}/release", response_model=schemas.InmateResponse, status_code=status.HTTP_200_OK)
def release_inmate(inmate_id: int, db: SessionDep):
    # First, fetch the inmate with joins before deletion
    result = db.execute(text("""
        SELECT 
            i.*,
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
    """), {"inmate_id": inmate_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Inmate not found")
        
    inmate_dict = dict(result._mapping)
        
    db.execute(text("DELETE FROM legal_case WHERE inmate_id = :inmate_id"), {"inmate_id": inmate_id})
    db.execute(text("DELETE FROM inmate WHERE inmate_id = :inmate_id"), {"inmate_id": inmate_id})
    
    db.commit()
        
    return inmate_dict

@router.get("/prison/{prison_id}", response_model=list[schemas.InmateResponse], status_code=status.HTTP_200_OK)
def get_inmates_by_prison(prison_id: int, db: SessionDep):
    inmates = db.execute(text("""
        SELECT 
            i.*,
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
        WHERE b.prison_id = :prison_id
        GROUP BY i.inmate_id
    """), {"prison_id": prison_id}).fetchall()
    
    return [dict(row._mapping) for row in inmates]

@router.get("/incident/{incident_id}", response_model=list[schemas.InmateResponse], status_code=status.HTTP_200_OK)
def get_inmates_by_incident(incident_id: int, db: SessionDep):
    inmates = db.execute(text("""
        SELECT 
            i.*,
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
        WHERE i.inmate_id IN (
            SELECT inmate_id FROM incident WHERE incident_id = :incident_id
            UNION
            SELECT inmate_id FROM incident_involvement WHERE incident_id = :incident_id
        )
        GROUP BY i.inmate_id
    """), {"incident_id": incident_id}).fetchall()
    
    return [dict(row._mapping) for row in inmates]
