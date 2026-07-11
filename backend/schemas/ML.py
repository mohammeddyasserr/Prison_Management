from sqlmodel import SQLModel
from datetime import datetime

class overcrowding_response(SQLModel):
    prison_id: int
    occupancy:int
    current_occupancy:int
    occupancy_after_30_Days: int
    occupancy_after_60_Days: int
    occupancy_after_90_Days: int

class overcrowding(SQLModel):
    prison_id: int
