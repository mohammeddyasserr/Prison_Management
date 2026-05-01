from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import select, text
import schemas
from database import SessionDep
from typing import List

router = APIRouter(
    prefix="/medical-visit",
   tags=["medical-visit"]
)

@router.get("/", response_model=List[schemas.MedicalVisitResponse])
def get_medical_visits(session: SessionDep):
    query = """
    SELECT 
        hv.visit_id,
        i.full_name AS inmate_name,
        d.name AS doctor_name,
        hv.visit_datetime,
        hv.diagnosis
    FROM health_visit hv
    JOIN inmate i ON hv.inmate_id = i.inmate_id
    JOIN doctor d ON hv.doctor_id = d.national_id
    """
    try:
        result = session.exec(text(query)).mappings().all()
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No medical visits found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {str(e)}")

@router.get("/prison/{prison_id}", response_model=List[schemas.MedicalVisitResponse])
def get_medical_visits_by_prison(prison_id: int, session: SessionDep):
    query = """
    SELECT 
        hv.visit_id,
        i.full_name AS inmate_name,
        d.name AS doctor_name,
        hv.visit_datetime,
        hv.diagnosis
    FROM health_visit hv
    JOIN inmate i ON hv.inmate_id = i.inmate_id
    JOIN doctor d ON hv.doctor_id = d.national_id
    WHERE d.prison_id = :prison_id
    """
    try:
        result = session.exec(text(query).bindparams(prison_id=prison_id)).mappings().all()
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No medical visits found for the specified prison")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {str(e)}")

@router.get("/inmate/{inmate_id}", response_model=List[schemas.MedicalVisitResponse])
def get_medical_visits_by_inmate(inmate_id: int, session: SessionDep):
    query = """
    SELECT 
        hv.visit_id,
        i.full_name AS inmate_name,
        d.name AS doctor_name,
        hv.visit_datetime,
        hv.diagnosis
    FROM health_visit hv
    JOIN inmate i ON hv.inmate_id = i.inmate_id
    JOIN doctor d ON hv.doctor_id = d.national_id
    WHERE hv.inmate_id = :inmate_id
    """
    try:
        result = session.exec(text(query).bindparams(inmate_id=inmate_id)).mappings().all()
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No medical visits found for the specified inmate")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {str(e)}")

@router.get("/doctor/{doctor_id}", response_model=List[schemas.MedicalVisitResponse])
def get_medical_visits_by_doctor(doctor_id: str, session: SessionDep):
    query = """
    SELECT 
        hv.visit_id,
        i.full_name AS inmate_name,
        d.name AS doctor_name,
        hv.visit_datetime,
        hv.diagnosis
    FROM health_visit hv
    JOIN inmate i ON hv.inmate_id = i.inmate_id
    JOIN doctor d ON hv.doctor_id = d.national_id
    WHERE hv.doctor_id = :doctor_id
    """
    try:
        result = session.exec(text(query).bindparams(doctor_id=doctor_id)).mappings().all()
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No medical visits found for the specified doctor")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {str(e)}")

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_medical_visit(visit: schemas.MedicalVisitCreate, session: SessionDep):
    query = """
    INSERT INTO health_visit (inmate_id, doctor_id, visit_datetime, diagnosis)
    VALUES (:inmate_id, :doctor_id, :visit_datetime, :diagnosis)
    RETURNING visit_id
    """
    try:
        result = session.exec(
            text(query).bindparams(
                inmate_id=visit.inmate_id,
                doctor_id=visit.doctor_id,
                visit_datetime=visit.visit_datetime.isoformat(),
                diagnosis=visit.diagnosis
            )
        )
        visit_id = result.scalar()
        session.commit()
        return {"message": "Medical visit created successfully", "visit_id": visit_id}
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not create medical visit: {str(e)}"
        )
