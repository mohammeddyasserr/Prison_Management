from sqlmodel import SQLModel


class TimeslotResponse(SQLModel):
    date: str
    start_time: str
    end_time: str


class VisitCreate(SQLModel):
    visit_type: str = "Regular"   # 'Regular' | 'Legal'
    visit_date: str
    inmate_id: int
    visitor_id: str


class VisitUpdate(SQLModel):
    status: str | None = None           # 'Pending' | 'Approved' | 'Denied'
    denial_reason: str | None = None
    visit_date: str | None = None


class VisitResponse(SQLModel):
    visit_id: int
    visit_type: str
    visit_date: str
    inmate_name: str
    visitor_name: str
    status: str
    denial_reason: str | None = None


class RejectVisitRequest(SQLModel):
    denial_reason: str


class VisitorCreate(SQLModel):
    national_id: str
    full_name: str
    relationship: str   # 'Spouse' | 'Parent' | 'Sibling' | 'Friend' | 'Lawyer' | 'Other'
    phone: str
    email: str | None = None


class VisitorResponse(SQLModel):
    national_id: str
    full_name: str
    relationship: str
    phone: str
    email: str | None = None
