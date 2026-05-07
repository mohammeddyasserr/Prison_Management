from sqlmodel import SQLModel, Field
from datetime import date

class PendingInmateBase(SQLModel):
    national_id: str
    full_name: str
    date_of_birth: date
    gender: str
    nationality: str
    occupation: str | None = None
    start_date: date
    education_level: str
    assigned_prison: int | None = Field(default=None, foreign_key="prison.prison_id")
    status: str = "Active"

class PendingInmate(PendingInmateBase, table=True):
    __tablename__ = "pending_inmate"
    pending_inmate_id: int | None = Field(default=None, primary_key=True)
