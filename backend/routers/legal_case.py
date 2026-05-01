from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import select, text
import schemas
import models
from database import SessionDep

router = APIRouter(
    prefix="/legal_case",
    tags=["legal_case"]
)

@router.get("", response_model=list[schemas.LegalCaseResponse], status_code=status.HTTP_200_OK)
def get_all(db: SessionDep):
    cases = db.execute(text("""
        SELECT *
        FROM legal_case 
    """)).fetchall()
    
    return cases

@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.LegalCaseResponse)
def create_legal_case(request: schemas.LegalCaseCreate, db: SessionDep):
    result = db.execute(text("""
        INSERT INTO legal_case (
            crime_type, inmate_id, court_name, 
            sentence_duration_years, sentence_duration_months, sentence_duration_days
        ) VALUES (
            :crime_type, :inmate_id, :court_name, 
            :sentence_duration_years, :sentence_duration_months, :sentence_duration_days
        ) RETURNING *
    """), request.model_dump())
    
    new_case = result.fetchone()
    db.commit()
    return new_case

@router.get("/inmate/{inmate_id}", response_model=list[schemas.LegalCaseResponse], status_code=status.HTTP_200_OK)
def get_cases_by_inmate(inmate_id: int, db: SessionDep):
    cases = db.execute(text("""
        SELECT *
        FROM legal_case 
        WHERE inmate_id = :inmate_id
    """), {"inmate_id": inmate_id}).fetchall()
    
    return cases
