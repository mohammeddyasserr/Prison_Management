from sqlmodel import SQLModel, Field

class PrisonBase(SQLModel):
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

class Prison(PrisonBase, table=True):
    __tablename__ = "prison"
    prison_id: int | None = Field(default=None, primary_key=True)
