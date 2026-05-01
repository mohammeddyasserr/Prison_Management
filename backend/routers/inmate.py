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
        SELECT *
        FROM inmate
    """)).fetchall()
    
    return [dict(row._mapping) for row in inmates]

@router.get("/{inmate_id}", response_model=schemas.InmateResponse, status_code=status.HTTP_200_OK)
def get_inmate(inmate_id: int, db: SessionDep):
    result = db.execute(text("""
        SELECT *
        FROM inmate
        WHERE inmate_id = :inmate_id
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
    
    new_inmate = dict(result.fetchone()._mapping)
    db.commit()
    return new_inmate

@router.delete("/{inmate_id}/release", response_model=schemas.InmateResponse, status_code=status.HTTP_200_OK)
def release_inmate(inmate_id: int, db: SessionDep):
    result = db.execute(text("""
        SELECT *
        FROM inmate
        WHERE inmate_id = :inmate_id
    """), {"inmate_id": inmate_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Inmate not found")
        
    inmate_dict = dict(result._mapping)
        
    db.execute(text("DELETE FROM legal_case WHERE inmate_id = :inmate_id"), {"inmate_id": inmate_id})
    db.execute(text("DELETE FROM inmate WHERE inmate_id = :inmate_id"), {"inmate_id": inmate_id})
    
    db.commit()
        
    return inmate_dict
