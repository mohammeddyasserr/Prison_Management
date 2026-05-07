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
    inmate_id:       int
    incident_id:     int | None = None
    imposed_by:      str
    punishment_type: str
    solitary_days:   int | None = None
    date_imposed:    date
    end_date:        str | None = None
    notes:           str | None = None


class DisciplinaryUpdate(SQLModel):
    inmate_id:       int                 
    imposed_by:      str                 
    incident_id:     int | None = None   
    punishment_type: PunishmentType | None = None
    solitary_days:   int | None = None
    date_imposed:    date | None = None
    notes:           str | None = None


class DisciplinaryResponse(SQLModel):
    inmate_id:       int
    inmate_name:     str | None = None
    incident_id:     int | None = None
    imposed_by:      str
    officer_name:    str | None = None
    punishment_type: str
    solitary_days:   int | None = None
    date_imposed:    date
    end_date:        str | None = None
    notes:           str | None = None
    prison_id:       int | None = None
