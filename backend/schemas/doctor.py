from sqlmodel import SQLModel
from typing import Optional


class DoctorResponse(SQLModel):
    national_id: str
    name: str
    address: Optional[str] = None
    phone: str
    prison_name: str


class DoctorCreate(SQLModel):
    national_id: str
    prison_id: int
    name: str
    address: Optional[str] = None
    phone: str
