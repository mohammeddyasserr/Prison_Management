from fastapi import APIRouter, status, HTTPException
from sqlmodel import text
import schemas
from database import SessionDep

router = APIRouter(
    prefix="/cell",
    tags=["cell"]
)

@router.get("/{cell_id}", status_code=status.HTTP_200_OK, response_model=schemas.CellResponse)
def get_cell_by_id(cell_id: int, db: SessionDep):
    cell = db.execute(text("""
        SELECT 
            c.*,
            c.capacity AS total_capacity,
            (
                SELECT COUNT(*)
                FROM inmate i
                WHERE i.assigned_cell = c.cell_id
            ) AS current_occupancy
        FROM cell c
        WHERE c.cell_id = :id
    """), {"id": cell_id}).fetchone()
    if not cell:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cell with id {cell_id} not found")
    return cell

@router.get("/block/{block_id}", status_code=status.HTTP_200_OK, response_model=list[schemas.CellResponse])
def get_cells_by_block(block_id: int, db: SessionDep):
    cells = db.execute(text("""
        SELECT 
            c.*,
            c.capacity AS total_capacity,
            (
                SELECT COUNT(*)
                FROM inmate i
                WHERE i.assigned_cell = c.cell_id
            ) AS current_occupancy
        FROM cell c
        WHERE c.block_id = :id
    """), {"id": block_id}).fetchall()
    return cells

@router.get("/prison/{prison_id}", status_code=status.HTTP_200_OK, response_model=list[schemas.CellResponse])
def get_cells_by_prison(prison_id: int, db: SessionDep):
    cells = db.execute(text("""
        SELECT 
            c.*,
            c.capacity AS total_capacity,
            (
                SELECT COUNT(*)
                FROM inmate i
                WHERE i.assigned_cell = c.cell_id
            ) AS current_occupancy
        FROM cell c
        JOIN block b ON c.block_id = b.block_id
        WHERE b.prison_id = :id
    """), {"id": prison_id}).fetchall()
    return cells

@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.CellResponse)
def create_cell(request: schemas.CellCreate, db: SessionDep):
    # Check if the block exists
    block = db.execute(text("SELECT * FROM block WHERE block_id = :id"), {"id": request.block_id}).fetchone()
    if not block:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Block with id {request.block_id} not found")

    result = db.execute(text("""
        INSERT INTO cell (block_id, capacity)
        VALUES (:block_id, :capacity)
        RETURNING *
    """), request.model_dump())
    
    new_cell = result.fetchone()
    db.commit()

    # Get the created cell with the calculated fields
    return get_cell_by_id(new_cell.cell_id, db)
