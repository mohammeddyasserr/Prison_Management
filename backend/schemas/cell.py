from sqlmodel import SQLModel

class CellCreate(SQLModel):
    block_id: int
    capacity: int

class CellResponse(SQLModel):
    cell_id: int
    block_id: int
    capacity: int
    total_capacity: int | None = 0
    current_occupancy: int | None = 0
