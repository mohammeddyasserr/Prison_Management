from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import select, text
import schemas
import models
from database import SessionDep

router = APIRouter(
    prefix="/prison",
   tags=["prison"]
)

@router.get("", response_model=list[schemas.PrisonResponse], status_code=status.HTTP_200_OK)
def list_prisons(db: SessionDep):
    prisons = db.execute(text("""
        SELECT 
            p.*, 
            o.name AS manager_name,
            (
                SELECT COALESCE(SUM(c.capacity), 0)
                FROM cell c
                JOIN block b ON c.block_id = b.block_id
                WHERE b.prison_id = p.prison_id
            ) AS total_capacity,
            (
                SELECT COUNT(*)
                FROM inmate i
                JOIN cell c ON i.assigned_cell = c.cell_id
                JOIN block b ON c.block_id = b.block_id
                WHERE b.prison_id = p.prison_id 
            ) AS current_occupancy
        FROM prison p
        LEFT JOIN officer o ON p.manager_id = o.national_id
    """)).fetchall()
    
    return prisons

@router.get("/{id}", status_code=status.HTTP_200_OK, response_model=schemas.PrisonResponse)
def get_prison_by_id(id: int, db: SessionDep):
    prison = db.execute(text("""
        SELECT 
            p.*, 
            o.name AS manager_name,
            (
                SELECT COALESCE(SUM(c.capacity), 0)
                FROM cell c
                JOIN block b ON c.block_id = b.block_id
                WHERE b.prison_id = p.prison_id
            ) AS total_capacity,
            (
                SELECT COUNT(*)
                FROM inmate i
                JOIN cell c ON i.assigned_cell = c.cell_id
                JOIN block b ON c.block_id = b.block_id
                WHERE b.prison_id = p.prison_id
            ) AS current_occupancy
        FROM prison p
        LEFT JOIN officer o ON p.manager_id = o.national_id
        WHERE p.prison_id = :id
    """), {"id": id}).fetchone()
    
    if not prison:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prison with id {id} not found")   
    
    return prison

@router.get("/user/{national_id}", status_code=status.HTTP_200_OK, response_model=schemas.PrisonResponse)
def get_prison_by_user(national_id: str, db: SessionDep):
    # First check if user is a manager (returns the first prison they manage)
    prison = db.execute(text("""
        SELECT 
            p.*, 
            o.name AS manager_name,
            (
                SELECT COALESCE(SUM(c.capacity), 0)
                FROM cell c
                JOIN block b ON c.block_id = b.block_id
                WHERE b.prison_id = p.prison_id
            ) AS total_capacity,
            (
                SELECT COUNT(*)
                FROM inmate i
                JOIN cell c ON i.assigned_cell = c.cell_id
                JOIN block b ON c.block_id = b.block_id
                WHERE b.prison_id = p.prison_id
            ) AS current_occupancy
        FROM prison p
        LEFT JOIN officer o ON p.manager_id = o.national_id
        WHERE p.manager_id = :national_id
    """), {"national_id": national_id}).fetchone()
    
    # If not a manager, check if they are an officer
    if not prison:
        prison = db.execute(text("""
            SELECT 
                p.*, 
                mo.name AS manager_name,
                (
                    SELECT COALESCE(SUM(c.capacity), 0)
                    FROM cell c
                    JOIN block b ON c.block_id = b.block_id
                    WHERE b.prison_id = p.prison_id
                ) AS total_capacity,
                (
                    SELECT COUNT(*)
                    FROM inmate i
                    JOIN cell c ON i.assigned_cell = c.cell_id
                    JOIN block b ON c.block_id = b.block_id
                    WHERE b.prison_id = p.prison_id 
                ) AS current_occupancy
            FROM prison p
            JOIN officer o ON p.prison_id = o.prison_id
            LEFT JOIN officer mo ON p.manager_id = mo.national_id
            WHERE o.national_id = :national_id
        """), {"national_id": national_id}).fetchone()
        
    if not prison:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No prison found for user with national_id {national_id}")   
    
    return prison

@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.PrisonResponse)
def create_prison(request: schemas.PrisonCreate, db: SessionDep):
    result = db.execute(text("""
        WITH new_prison AS (
            INSERT INTO prison (
                name, type, security_level, location, manager_id,
                has_hospital, has_workshops, has_agricultural_ward, 
                has_visitation_hall, visitation_hall_capacity
            ) VALUES (
                :name, :type, :security_level, :location, :manager_id,
                :has_hospital, :has_workshops, :has_agricultural_ward, 
                :has_visitation_hall, :visitation_hall_capacity
            ) RETURNING *
        )
        SELECT 
            np.*, 
            o.name AS manager_name,
            0 AS total_capacity,
            0 AS current_occupancy
        FROM new_prison np 
        LEFT JOIN officer o ON np.manager_id = o.national_id
    """), request.model_dump())
    
    new_prison = result.fetchone()
    db.commit()
    return new_prison

@router.put("/{id}", status_code=status.HTTP_200_OK, response_model=schemas.PrisonResponse)
def update_prison(id: int, request: schemas.PrisonCreate, db: SessionDep):
    result = db.execute(text("""
        WITH updated_prison AS (
            UPDATE prison SET
                name = :name,
                type = :type,
                security_level = :security_level,
                location = :location,
                manager_id = :manager_id,
                has_hospital = :has_hospital,
                has_workshops = :has_workshops,
                has_agricultural_ward = :has_agricultural_ward,
                has_visitation_hall = :has_visitation_hall,
                visitation_hall_capacity = :visitation_hall_capacity
            WHERE prison_id = :id
            RETURNING *
        )
        SELECT 
            up.*, 
            o.name AS manager_name,
            (
                SELECT COALESCE(SUM(c.capacity), 0)
                FROM cell c
                JOIN block b ON c.block_id = b.block_id
                WHERE b.prison_id = up.prison_id
            ) AS total_capacity,
            (
                SELECT COUNT(*)
                FROM inmate i
                JOIN cell c ON i.assigned_cell = c.cell_id
                JOIN block b ON c.block_id = b.block_id
                WHERE b.prison_id = up.prison_id
            ) AS current_occupancy
        FROM updated_prison up 
        LEFT JOIN officer o ON up.manager_id = o.national_id
    """), {"id": id, **request.model_dump()})
    
    updated_prison = result.fetchone()
    
    if not updated_prison:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prison with id {id} not found")
        
    db.commit()
    return updated_prison

@router.get("/{id}/blocks-cells", status_code=status.HTTP_200_OK)
def get_prison_blocks_and_cells(id: int, db: SessionDep):
    blocks = db.execute(text("""
        SELECT 
            b.block_id, 
            b.security_level, 
            COALESCE((
                SELECT COUNT(*)
                FROM inmate i
                JOIN cell c ON i.assigned_cell = c.cell_id
                WHERE c.block_id = b.block_id
            ), 0) AS total_inmates,
            (SELECT COUNT(*) FROM cell WHERE block_id = b.block_id) as total_cells
        FROM block b
        WHERE b.prison_id = :id
    """), {"id": id}).mappings().fetchall()

    result = []
    for block in blocks:
        block_dict = dict(block)
        cells = db.execute(text("""
            SELECT 
                c.cell_id, 
                c.capacity,
                COALESCE((
                    SELECT COUNT(*)
                    FROM inmate i
                    WHERE i.assigned_cell = c.cell_id
                ), 0) AS occupancy
            FROM cell c
            WHERE c.block_id = :block_id
        """), {"block_id": block_dict["block_id"]}).mappings().fetchall()
        
        processed_cells = []
        for c in cells:
            cell_dict = dict(c)
            if cell_dict["occupancy"] >= cell_dict["capacity"]:
                cell_dict["status"] = "Full"
            elif cell_dict["occupancy"] > 0:
                cell_dict["status"] = "Occupied"
            else:
                cell_dict["status"] = "Empty"
            processed_cells.append(cell_dict)
            
        block_dict["cells"] = processed_cells
        result.append(block_dict)
        
    return result