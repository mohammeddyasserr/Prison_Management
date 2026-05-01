from sqlmodel import SQLModel, Field


class VisitBase(SQLModel):
    visit_type: str = "Regular"
    visit_date: str
    inmate_id: int
    visitor_id: int
    duration_minutes: int = 30
    status: str = "Pending"
    denial_reason: str | None = None


class Visit(VisitBase, table=True):
    __tablename__ = "visit"
    visit_id: int | None = Field(default=None, primary_key=True)
