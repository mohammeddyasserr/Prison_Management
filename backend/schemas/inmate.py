from sqlmodel import SQLModel
from datetime import date
from typing import Optional

class LegalCaseCreate(SQLModel):
    case_number: str
    crime_type: str
    court_name: str
    sentence_duration: str

class LegalCaseResponse(SQLModel):
    case_id: int
    case_number: str
    crime_type: str
    court_name: str
    sentence_duration: str
    inmate_id: int

class InmateCreate(SQLModel):
    national_id: str
    full_name: str
    date_of_birth: date
    gender: str
    nationality: str
    occupation: str | None = None
    start_date: date
    expected_release_date: date | None = None
    assigned_prison: int | None = None
    assigned_block: int | None = None
    assigned_cell: int | None = None
    status: str | None = "active"
    legal_case: Optional[LegalCaseCreate] = None

class InmateResponse(SQLModel):
    inmate_id: int
    national_id: str
    full_name: str
    date_of_birth: date
    gender: str
    nationality: str
    occupation: str | None = None
    start_date: date
    expected_release_date: date | None = None
    assigned_prison: int | None = None
    assigned_block: int | None = None
    assigned_cell: int | None = None
    status: str | None = None
    prison_name: str | None = None
    legal_case: Optional[LegalCaseResponse] = None
