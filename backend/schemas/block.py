from sqlmodel import SQLModel

class BlockCreate(SQLModel):
    prison_id: int
    security_level: str

class BlockResponse(SQLModel):
    block_id: int
    prison_id: int
    security_level: str
    total_capacity: int | None = 0
    current_occupancy: int | None = 0
    number_of_cells: int | None = 0
