from sqlmodel import SQLModel
from typing import Optional
from datetime import date
from enum import Enum


class PunishmentType(str, Enum):
    LOSS_OF_PRIVILEGES = "Loss of Privileges"
    SOLITARY_CONFINEMENT = "Solitary Confinement"
    TRANSFER_TO_HIGH_SECURITY = "Transfer to High-Security"
    OTHER = "Other"


class DisciplinaryCreate(SQLModel):
    inmate_id: int
    incident_id: Optional[int] = None
    imposed_by: str
    punishment_type: PunishmentType
    solitary_days: Optional[int] = None
    date_imposed: date
    notes: Optional[str] = None


class DisciplinaryUpdate(SQLModel):
    inmate_id: Optional[int] = None
    incident_id: Optional[int] = None
    imposed_by: Optional[str] = None
    punishment_type: Optional[PunishmentType] = None
    solitary_days: Optional[int] = None
    date_imposed: Optional[date] = None
    notes: Optional[str] = None


class DisciplinaryResponse(SQLModel):
    log_id: int
    inmate_id: int
    inmate_name: str
    incident_id: Optional[int]
    imposed_by: str
    officer_name: str
    punishment_type: str
    solitary_days: Optional[int]
    date_imposed: date
    notes: Optional[str]
