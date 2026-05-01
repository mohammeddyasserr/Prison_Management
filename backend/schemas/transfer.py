from datetime import datetime, date
from sqlmodel import SQLModel


class TransferCreate(SQLModel):
    inmate_id: int
    requesting_prison: int
    destination_prison: int
    manager_id: int
    reason: str


class TransferUpdate(SQLModel):
    status: str | None = None          # 'Pending' | 'Approved' | 'Denied'
    approved_by: int | None = None
    approval_date: date | None = None


class TransferResponse(SQLModel):
    transfer_id: int
    inmate_id: int
    requesting_prison: int
    destination_prison: int
    manager_id: int
    reason: str
    status: str
    requested_at: datetime | None = None
    approved_by: int | None = None
    approval_date: date | None = None
