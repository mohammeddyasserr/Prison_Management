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
        SELECT i.*, p.name as prison_name
        FROM inmate i
        LEFT JOIN prison p ON i.assigned_prison = p.prison_id
    """)).fetchall()
    
    return [dict(row._mapping) for row in inmates]

@router.get("/{inmate_id}", response_model=schemas.InmateResponse, status_code=status.HTTP_200_OK)
def get_inmate(inmate_id: int, db: SessionDep):
    result = db.execute(text("""
        SELECT i.*, p.name as prison_name
        FROM inmate i
        LEFT JOIN prison p ON i.assigned_prison = p.prison_id
        WHERE i.inmate_id = :inmate_id
    """), {"inmate_id": inmate_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Inmate not found")

    inmate_dict = dict(result._mapping)

    legal_case = db.execute(text("""
        SELECT * FROM legal_cases WHERE inmate_id = :inmate_id
    """), {"inmate_id": inmate_id}).fetchone()

    if legal_case:
        inmate_dict['legal_case'] = dict(legal_case._mapping)
    else:
        inmate_dict['legal_case'] = None

    return inmate_dict

@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.InmateResponse)
def create_inmate(request: schemas.InmateCreate, db: SessionDep):
    inmate_data = request.model_dump(exclude={"legal_case"})
    
    result = db.execute(text("""
        INSERT INTO inmate (
            national_id, full_name, date_of_birth, gender, nationality, 
            occupation, start_date, expected_release_date, assigned_prison, 
            assigned_block, assigned_cell, status
        ) VALUES (
            :national_id, :full_name, :date_of_birth, :gender, :nationality, 
            :occupation, :start_date, :expected_release_date, :assigned_prison, 
            :assigned_block, :assigned_cell, :status
        ) RETURNING *
    """), inmate_data)
    
    new_inmate = dict(result.fetchone()._mapping)
    
    if request.legal_case:
        legal_case_data = request.legal_case.model_dump()
        legal_case_data['inmate_id'] = new_inmate['inmate_id']
        lc_result = db.execute(text("""
            INSERT INTO legal_cases (
                case_number, crime_type, court_name, sentence_duration, inmate_id
            ) VALUES (
                :case_number, :crime_type, :court_name, :sentence_duration, :inmate_id
            ) RETURNING *
        """), legal_case_data)
        new_inmate['legal_case'] = dict(lc_result.fetchone()._mapping)
    else:
        new_inmate['legal_case'] = None

    if new_inmate.get('assigned_prison'):
        prison = db.execute(text("SELECT name FROM prison WHERE prison_id = :prison_id"), 
                            {"prison_id": new_inmate['assigned_prison']}).fetchone()
        if prison:
            new_inmate['prison_name'] = prison.name

    db.commit()
    return new_inmate
