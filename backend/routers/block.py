from fastapi import APIRouter, status, HTTPException
from sqlmodel import text
import schemas
from database import SessionDep

router = APIRouter(
    prefix="/block",
    tags=["block"]
)

@router.get("/{block_id}", status_code=status.HTTP_200_OK, response_model=schemas.BlockResponse)
def get_block_by_id(block_id: int, db: SessionDep):
    block = db.execute(text("""
        SELECT 
            b.*,
            (
                SELECT COALESCE(SUM(c.capacity), 0)
                FROM cell c
                WHERE c.block_id = b.block_id
            ) AS total_capacity,
            (
                SELECT COUNT(*)
                FROM cell c
                WHERE c.block_id = b.block_id
            ) AS number_of_cells,
            (
                SELECT COUNT(*)
                FROM inmate i
                JOIN cell c ON i.assigned_cell = c.cell_id
                WHERE c.block_id = b.block_id
            ) AS current_occupancy
        FROM block b
        WHERE b.block_id = :id
    """), {"id": block_id}).fetchone()
    if not block:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Block with id {block_id} not found")
    return block

@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.BlockResponse)
def create_block(request: schemas.BlockCreate, db: SessionDep):
    # Check if the prison exists
    prison = db.execute(text("SELECT * FROM prison WHERE prison_id = :id"), {"id": request.prison_id}).fetchone()
    if not prison:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prison with id {request.prison_id} not found")

    result = db.execute(text("""
        INSERT INTO block (prison_id, security_level)
        VALUES (:prison_id, :security_level)
        RETURNING *
    """), request.model_dump())
    
    new_block = result.fetchone()
    db.commit()

    # Get the created block with the calculated fields
    return get_block_by_id(new_block.block_id, db)
