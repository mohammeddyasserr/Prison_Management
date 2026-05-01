from sqlmodel import SQLModel, Field
from datetime import date

class ShiftBase(SQLModel):
    shift_type: str
    officer_id: str = Field(foreign_key="officer.national_id")
    manager_id: str = Field(foreign_key="officer.national_id")
    block_id: int = Field(foreign_key="block.block_id")
    date: date

class Shift(ShiftBase, table=True):
    __tablename__ = "Shift"
    shift_id: int | None = Field(default=None, primary_key=True)
