from sqlmodel import SQLModel


class StaffResponse(SQLModel):
    national_id: str
    name: str
    email: str
    phone: str
    role: str
    prison_name: str


class StaffCreate(SQLModel):
    national_id: str
    name: str
    email: str
    phone: str
    address: str
    password_hash: str
    prison_id: int
