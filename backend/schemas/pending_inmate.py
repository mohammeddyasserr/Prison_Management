from sqlmodel import SQLModel
from datetime import date

class PendingInmateCreate(SQLModel):
    national_id: str
    full_name: str
    date_of_birth: date
    gender: str
    nationality: str
    occupation: str | None = None
    start_date: date
    education_level: str
    assigned_prison: int | None = None

class PendingInmateResponse(SQLModel):
    pending_inmate_id: int
    national_id: str
    full_name: str
    date_of_birth: date
    gender: str
    nationality: str
    occupation: str | None = None
    start_date: date
    education_level: str
    assigned_prison: int | None = None
    prison_name: str | None = None

