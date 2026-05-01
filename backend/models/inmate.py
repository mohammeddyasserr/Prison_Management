from sqlmodel import SQLModel, Field
from datetime import date

class InmateBase(SQLModel):
    national_id: str
    full_name: str
    date_of_birth: date
    gender: str
    nationality: str
    occupation: str | None = None
    start_date: date
    education_level: str
    assigned_cell: int | None = None

class Inmate(InmateBase, table=True):
    __tablename__ = "inmate"
    inmate_id: int | None = Field(default=None, primary_key=True)
