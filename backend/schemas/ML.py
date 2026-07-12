from pydantic import BaseModel


class InmateRiskResponse(BaseModel):
    model_config = {"from_attributes": True}

    inmate_id: int
    full_name: str
    risk_level: str
    recidivism: int | None = None
    prison_id: int | None = None
    prison_name: str | None = None


class OvercrowdingResponse(BaseModel):
    model_config = {"from_attributes": True}

    prison_id: int
    prison_name: str
    current_occupancy: int
    total_capacity: int
    current_rate: int
    occupancy_next_30_days: int | None = None
    occupancy_next_60_days: int | None = None
    occupancy_next_90_days: int | None = None
    forecast_rate_30: int
    forecast_rate_60: int
    forecast_rate_90: int


class overcrowding_response(BaseModel):
    model_config = {"from_attributes": True}

    prison_id: int
    occupancy: int
    current_occupancy: int
    occupancy_after_30_Days: int
    occupancy_after_60_Days: int
    occupancy_after_90_Days: int
