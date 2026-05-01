from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import select, text
import schemas
from database import SessionDep

router = APIRouter(
    prefix="/doctor",
   tags=["doctor"]
)

@router.get("/", response_model=list[schemas.DoctorResponse])
def get_all_doctors(session: SessionDep):
    statement = text("""
        SELECT d.national_id, d.name, d.address, d.phone, p.name as prison_name
        FROM doctor d
        JOIN prison p ON d.prison_id = p.prison_id
    """)
    try:
        result = session.exec(statement).mappings().all()
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No doctors found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {str(e)}")

@router.get("/prison/{prison_id}", response_model=list[schemas.DoctorResponse])
def get_doctors_by_prison(prison_id: int, session: SessionDep):
    statement = text("""
        SELECT d.national_id, d.name, d.address, d.phone, p.name as prison_name
        FROM doctor d
        JOIN prison p ON d.prison_id = p.prison_id
        WHERE d.prison_id = :prison_id
    """)
    try:
        result = session.exec(statement, params={"prison_id": prison_id}).mappings().all()
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No doctors found for the specified prison")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {str(e)}")

@router.post("/", response_model=schemas.DoctorCreate, status_code=status.HTTP_201_CREATED)
def create_doctor(doctor: schemas.DoctorCreate, session: SessionDep):
    statement = text("""
        INSERT INTO doctor (national_id, prison_id, name, address, phone)
        VALUES (:national_id, :prison_id, :name, :address, :phone)
    """)
    session.exec(statement, params=doctor.model_dump())
    session.commit()
    return doctor

