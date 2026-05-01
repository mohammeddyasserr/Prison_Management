from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import text
import schemas
from database import SessionDep

router = APIRouter(
    prefix="/legal_cases",
    tags=["legal_cases"]
)

@router.get("", response_model=list[schemas.LegalCaseResponse], status_code=status.HTTP_200_OK)
def get_all(db: SessionDep):
    cases = db.execute(text("""
        SELECT *
        FROM legal_case
    """)).fetchall()
    
    return [dict(row._mapping) for row in cases]

@router.get("/{case_number}", response_model=schemas.LegalCaseResponse, status_code=status.HTTP_200_OK)
def get_legal_case(case_number: int, db: SessionDep):
    result = db.execute(text("""
        SELECT *
        FROM legal_case
        WHERE case_number = :case_number
    """), {"case_number": case_number}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Legal case not found")

    return dict(result._mapping)

@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.LegalCaseResponse)
def create_legal_case(request: schemas.LegalCaseCreate, db: SessionDep):
    # Verify inmate exists
    inmate = db.execute(text("""
        SELECT * FROM inmate WHERE inmate_id = :inmate_id
    """), {"inmate_id": request.inmate_id}).fetchone()
    
    if not inmate:
        raise HTTPException(status_code=404, detail="Inmate not found")

    case_data = request.model_dump()
    
    result = db.execute(text("""
        INSERT INTO legal_case (
            crime_type, court_name, sentence_duration_years, 
            sentence_duration_months, sentence_duration_days, inmate_id
        ) VALUES (
            :crime_type, :court_name, :sentence_duration_years, 
            :sentence_duration_months, :sentence_duration_days, :inmate_id
        ) RETURNING *
    """), case_data)
    
    new_case = dict(result.fetchone()._mapping)
    db.commit()
    return new_case

@router.delete("/{case_number}", response_model=schemas.LegalCaseResponse, status_code=status.HTTP_200_OK)
def delete_legal_case(case_number: int, db: SessionDep):
    result = db.execute(text("""
        SELECT *
        FROM legal_case
        WHERE case_number = :case_number
    """), {"case_number": case_number}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Legal case not found")
        
    case_dict = dict(result._mapping)
        
    db.execute(text("DELETE FROM legal_case WHERE case_number = :case_number"), {"case_number": case_number})
    db.commit()
        
    return case_dict
