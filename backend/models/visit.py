from sqlmodel import SQLModel, Field


class TimeslotBase(SQLModel):
    label: str
    start_time: str
    end_time: str


class Timeslot(TimeslotBase, table=True):
    __tablename__ = "timeslot"
    timeslot_id: int | None = Field(default=None, primary_key=True)


class VisitBase(SQLModel):
    visit_type: str = "Regular"
    visit_date: str
    timeslot_id: int
    inmate_id: int
    visitor_id: str
    status: str = "Pending"
    denial_reason: str | None = None


class Visit(VisitBase, table=True):
    __tablename__ = "visit"
    visit_id: int | None = Field(default=None, primary_key=True)


class VisitorBase(SQLModel):
    national_id: str
    full_name: str
    relationship: str
    phone: str
    email: str | None = None


class Visitor(VisitorBase, table=True):
    __tablename__ = "visitor"
    national_id: str = Field(primary_key=True)
