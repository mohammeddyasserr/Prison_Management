from sqlmodel import SQLModel, Field

class LegalCaseBase(SQLModel):
    case_number: str
    crime_type: str
    court_name: str
    sentence_duration: str
    inmate_id: int | None = Field(default=None, foreign_key="inmate.inmate_id")

class LegalCase(LegalCaseBase, table=True):
    __tablename__ = "legal_cases"
    case_id: int | None = Field(default=None, primary_key=True)
