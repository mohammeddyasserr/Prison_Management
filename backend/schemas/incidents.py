from sqlmodel import SQLModel
from typing import List, Optional
from datetime import datetime
from enum import Enum
from pydantic import field_validator


class IncidentType(str, Enum):
    FIGHT = "Fight"
    SELF_HARM = "Self-Harm"
    ESCAPE_ATTEMPT = "Escape Attempt"
    PROPERTY_DAMAGE = "Property Damage"
    ASSAULT_ON_STAFF = "Assault on Staff"
    OTHER = "Other"


class IncidentCreate(SQLModel):
    type: str
    block_id: int | None = None
    occurred_at: datetime
    reporting_officer: str
    description: str | None = None
    action_taken: str
    involved_inmate_ids: list[int] = []

# class IncidentCreate(SQLModel):
#     type: IncidentType
#     inmate_id: int
#     block_id: Optional[int] = None
#     occurred_at: datetime
#     reporting_officer: str
#     description: Optional[str] = None
#     action_taken: str
#     involved_inmate_ids: Optional[List[int]] = None


class IncidentUpdate(SQLModel):
    type: str | None = None
    block_id: int | None = None
    occurred_at: datetime | None = None
    reporting_officer: str | None = None
    description: str | None = None
    action_taken: str | None = None
    involved_inmate_ids: list[int] | None = None

# class IncidentUpdate(SQLModel):
#     type: Optional[IncidentType] = None
#     inmate_id: Optional[int] = None
#     block_id: Optional[int] = None
#     occurred_at: Optional[datetime] = None
#     reporting_officer: Optional[str] = None
#     description: Optional[str] = None
#     action_taken: Optional[str] = None
#     involved_inmate_ids: Optional[List[int]] = None



class IncidentResponse(SQLModel):
    incident_id:          int
    type:                 str
    occurred_at:          datetime
    description:          str | None = None
    action_taken:         str
    block_id:             int | None = None
    block_security_level: str | None = None
    prison_id:            int | None = None
    prison_name:          str | None = None
    reporting_officer:    str
    officer_name:         str | None = None
    involved_inmate_ids:  str | None = None
    involved_inmate_names: str | None = None

# class IncidentResponse(SQLModel):
#     incident_id:          int
#     type:                 str
#     occurred_at:          datetime
#     description:          str | None = None
#     action_taken:         str
#     inmate_id:            int
#     inmate_name:          str | None = None
#     block_id:             int | None = None
#     block_security_level: str | None = None
#     prison_id:            int | None = None
#     prison_name:          str | None = None
#     reporting_officer:    str
#     officer_name:         str | None = None
#     involved_inmate_ids:  str | None = None  