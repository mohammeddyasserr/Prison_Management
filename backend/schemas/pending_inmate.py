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
    status: str = "Active"


class PendingInmateResponse(BaseModel):
    model_config = {"from_attributes": True}
    pending_inmate_id: int
    national_id: str
    full_name: str
    date_of_birth: str
    gender: str
    nationality: str
    occupation: str | None = None
    start_date: str
    education_level: str
    assigned_prison: int | None = None
    status: str
    prison_name: str | None = None
    release_date: str | None = None
    legal_cases: list[LegalCaseInfo] = []

