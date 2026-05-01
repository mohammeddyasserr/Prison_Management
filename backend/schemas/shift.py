from sqlmodel import SQLModel
from datetime import date

class ShiftCreate(SQLModel):
    shift_type: str
    officer_id: str
    manager_id: str
    block_id: int
    date: date

class ShiftResponse(SQLModel):
    shift_id: int
    shift_type: str
    officer_id: str
    manager_id: str
    block_id: int
    date: date
    officer_name: str | None = None
    block_name: str | None = None
    prison_name: str | None = None
    time_range: str | None = None
