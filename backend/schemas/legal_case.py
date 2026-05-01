from sqlmodel import SQLModel

class LegalCaseCreate(SQLModel):
    crime_type: str
    inmate_id: int
    court_name: str
    sentence_duration_years: int
    sentence_duration_months: int
    sentence_duration_days: int

class LegalCaseResponse(SQLModel):
    case_number: int
    crime_type: str
    inmate_id: int
    court_name: str
    sentence_duration_years: int
    sentence_duration_months: int
    sentence_duration_days: int
