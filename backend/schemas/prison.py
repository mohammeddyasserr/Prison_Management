from sqlmodel import SQLModel

class PrisonCreate(SQLModel):
    name: str
    type: str
    security_level: str
    location: str
    manager_id: str | None = None
    has_hospital: bool = False
    has_workshops: bool = False
    has_agricultural_ward: bool = False
    has_visitation_hall: bool = False
    visitation_hall_capacity: int | None = None

class PrisonResponse(SQLModel):
    prison_id: int
    name: str
    type: str
    security_level: str
    location: str
    manager_name: str | None = None
    has_hospital: bool
    has_workshops: bool
    has_agricultural_ward: bool
    has_visitation_hall: bool
    visitation_hall_capacity: int | None = None
    total_capacity: int | None = 0
    current_occupancy: int | None = 0
