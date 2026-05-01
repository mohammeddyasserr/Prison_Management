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
    expected_release_date: date | None = None
    assigned_prison: int | None = None
    assigned_block: int | None = None
    assigned_cell: int | None = None
    status: str | None = "active"

class Inmate(InmateBase, table=True):
    __tablename__ = "inmate"
    inmate_id: int | None = Field(default=None, primary_key=True)
