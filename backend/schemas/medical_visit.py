from sqlmodel import SQLModel
from datetime import datetime

class MedicalVisitResponse(SQLModel):
    visit_id: int
    inmate_name: str
    doctor_name: str
    visit_datetime: datetime
    diagnosis: str

class MedicalVisitCreate(SQLModel):
    inmate_id: int
    doctor_id: str
    visit_datetime: datetime
    diagnosis: str