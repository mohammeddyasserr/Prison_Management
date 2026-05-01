from sqlmodel import SQLModel
from datetime import date

class InmateCreate(SQLModel):
    national_id: str
    full_name: str
    date_of_birth: date
    gender: str
    nationality: str
    occupation: str | None = None
    start_date: date
    education_level: str
    assigned_cell: int | None = None

class InmateResponse(SQLModel):
    inmate_id: int
    national_id: str
    full_name: str
    date_of_birth: date
    gender: str
    nationality: str
    occupation: str | None = None
    start_date: date
    education_level: str
    assigned_cell: int | None = None
    prison_name: str | None = None
    release_date: date | None = None
