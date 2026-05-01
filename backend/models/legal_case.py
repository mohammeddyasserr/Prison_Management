from sqlmodel import SQLModel, Field

class LegalCaseBase(SQLModel):
    crime_type: str
    inmate_id: int | None = Field(default=None, foreign_key="inmate.inmate_id")
    court_name: str
    sentence_duration_years: int
    sentence_duration_months: int
    sentence_duration_days: int

class LegalCase(LegalCaseBase, table=True):
    __tablename__ = "legal_case"
    case_number: int | None = Field(default=None, primary_key=True)
