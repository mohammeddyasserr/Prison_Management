from sqlmodel import SQLModel
from datetime import date
from pydantic import BaseModel


class ShiftCreate(SQLModel):
    shift_type: str
    officer_id: str
    manager_id: str
    block_id: int
    date: date


class ShiftResponse(BaseModel):
    model_config = {"from_attributes": True}
    shift_id: int
    shift_type: str
    officer_id: str
    manager_id: str
    block_id: int | None = None
    date: str | None = None
    officer_name: str | None = None
    prison_name: str | None = None
    time_range: str | None = None
