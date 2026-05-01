from sqlmodel import SQLModel


class VisitCreate(SQLModel):
    visit_type: str = "Regular"   # 'Regular' | 'Legal'
    visit_date: str
    inmate_id: int
    visitor_id: int
    duration_minutes: int = 30


class VisitUpdate(SQLModel):
    status: str | None = None           # 'Pending' | 'Approved' | 'Denied'
    denial_reason: str | None = None
    visit_date: str | None = None
    duration_minutes: int | None = None


class VisitResponse(SQLModel):
    visit_id: int
    visit_type: str
    visit_date: str
    inmate_id: int
    visitor_id: int
    duration_minutes: int
    status: str
    denial_reason: str | None = None
