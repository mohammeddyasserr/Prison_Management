from datetime import datetime, date
from sqlmodel import SQLModel, Field


class TransferBase(SQLModel):
    inmate_id: int
    requesting_prison: int
    destination_prison: int
    manager_id: int
    reason: str
    status: str = "Pending"
    requested_at: datetime | None = None
    approved_by: int | None = None
    approval_date: date | None = None


class Transfer(TransferBase, table=True):
    __tablename__ = "transfer"
    transfer_id: int | None = Field(default=None, primary_key=True)
