from sqlmodel import SQLModel
from typing import List, Optional
from datetime import datetime
from enum import Enum
from pydantic import field_validator, BaseModel


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


class IncidentUpdate(SQLModel):
    type: str | None = None
    block_id: int | None = None
    occurred_at: datetime | None = None
    reporting_officer: str | None = None
    description: str | None = None
    action_taken: str | None = None
    involved_inmate_ids: list[int] | None = None


class IncidentResponse(BaseModel):
    model_config = {"from_attributes": True}
    incident_id:          int
    type:                 str
    occurred_at:          str
    description:          str | None = None
    action_taken: str | None = None
    block_id:             int | None = None
    block_security_level: str | None = None
    prison_id:            int | None = None
    prison_name:          str | None = None
    reporting_officer:    str
    officer_name:         str | None = None
    involved_inmate_ids:  str | None = None
    involved_inmate_names: str | None = None  