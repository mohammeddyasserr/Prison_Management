from fastapi import APIRouter, status, HTTPException
from sqlmodel import text
import schemas
from database import SessionDep

router = APIRouter(
    prefix="/transfer",
    tags=["transfer"]
)


@router.get("", response_model=list[schemas.TransferResponse], status_code=status.HTTP_200_OK)
def get_all_transfers(db: SessionDep):
    transfers = db.execute(text("""
        SELECT *
        FROM transfer
    """)).fetchall()
    return transfers


@router.get("/{transfer_id}", response_model=schemas.TransferResponse, status_code=status.HTTP_200_OK)
def get_transfer(transfer_id: int, db: SessionDep):
    transfer = db.execute(text("""
        SELECT *
        FROM transfer
        WHERE transfer_id = :transfer_id
    """), {"transfer_id": transfer_id}).fetchone()

    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transfer with id {transfer_id} not found"
        )
    return transfer


@router.post("", response_model=schemas.TransferResponse, status_code=status.HTTP_201_CREATED)
def create_transfer(request: schemas.TransferCreate, db: SessionDep):
    result = db.execute(text("""
        INSERT INTO transfer (
            inmate_id, requesting_prison, destination_prison,
            manager_id, reason
        ) VALUES (
            :inmate_id, :requesting_prison, :destination_prison,
            :manager_id, :reason
        ) RETURNING *
    """), request.model_dump())

    new_transfer = result.fetchone()
    db.commit()
    return new_transfer


@router.put("/{transfer_id}", response_model=schemas.TransferResponse, status_code=status.HTTP_200_OK)
def update_transfer(transfer_id: int, request: schemas.TransferUpdate, db: SessionDep):
    # Check the transfer exists
    existing = db.execute(text("""
        SELECT * FROM transfer WHERE transfer_id = :transfer_id
    """), {"transfer_id": transfer_id}).fetchone()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transfer with id {transfer_id} not found"
        )

    # Build a dynamic SET clause for only the provided fields
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        return existing

    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["transfer_id"] = transfer_id

    result = db.execute(text(f"""
        UPDATE transfer
        SET {set_clause}
        WHERE transfer_id = :transfer_id
        RETURNING *
    """), updates)

    updated_transfer = result.fetchone()
    db.commit()
    return updated_transfer


@router.delete("/{transfer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transfer(transfer_id: int, db: SessionDep):
    existing = db.execute(text("""
        SELECT transfer_id FROM transfer WHERE transfer_id = :transfer_id
    """), {"transfer_id": transfer_id}).fetchone()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transfer with id {transfer_id} not found"
        )

    db.execute(text("""
        DELETE FROM transfer WHERE transfer_id = :transfer_id
    """), {"transfer_id": transfer_id})
    db.commit()
