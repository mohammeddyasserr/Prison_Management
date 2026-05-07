from sqlmodel import SQLModel
from datetime import date
from pydantic import BaseModel


class LegalCaseInfo(BaseModel):
    case_number: int
    crime_type: str
    court_name: str
    sentence_duration_years: int
    sentence_duration_months: int
    sentence_duration_days: int


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
    assigned_prison: int | None = None
    status: str = "Active"


class InmateResponse(BaseModel):
    model_config = {"from_attributes": True}
    inmate_id: int
    source: str = "inmate"
    national_id: str
    full_name: str
    date_of_birth: str
    gender: str
    nationality: str
    occupation: str | None = None
    start_date: str
    education_level: str
    assigned_cell: int | None = None
    block_id: int | None = None
    assigned_prison: int | None = None
    status: str
    prison_name: str | None = None
    release_date: str | None = None
    legal_cases: list[LegalCaseInfo] = []
