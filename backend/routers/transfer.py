from fastapi import APIRouter, status, HTTPException
from sqlmodel import text
import schemas
from database import SessionDep

router = APIRouter(
    prefix="/transfer",
    tags=["transfer"]
)


def _transfer_query() -> str:
    return """
        SELECT 
            t.*,
            i.full_name as inmate_name,
            p1.name as from_prison,
            p2.name as to_prison
        FROM transfer t
        JOIN inmate i ON t.inmate_id = i.inmate_id
        JOIN prison p1 ON t.requesting_prison = p1.prison_id
        JOIN prison p2 ON t.destination_prison = p2.prison_id
    """


@router.get("", response_model=list[schemas.TransferResponse], status_code=status.HTTP_200_OK)
def get_all_transfers(db: SessionDep):
    transfers = db.execute(text(_transfer_query())).fetchall()
    return transfers


@router.get("/{transfer_id}", response_model=schemas.TransferResponse, status_code=status.HTTP_200_OK)
def get_transfer(transfer_id: int, db: SessionDep):
    transfer = db.execute(text(f"""
        {_transfer_query()}
        WHERE t.transfer_id = :transfer_id
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
        ) RETURNING transfer_id
    """), request.model_dump())

    new_id = result.fetchone()[0]
    db.commit()
    
    new_transfer = db.execute(text(f"""
        {_transfer_query()}
        WHERE t.transfer_id = :transfer_id
    """), {"transfer_id": new_id}).fetchone()
    
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
    if updates:
        set_clause = ", ".join(f"{k} = :{k}" for k in updates)
        updates["transfer_id"] = transfer_id

        db.execute(text(f"""
            UPDATE transfer
            SET {set_clause}
            WHERE transfer_id = :transfer_id
        """), updates)
        db.commit()

    # Fetch updated state with names
    updated_transfer = db.execute(text(f"""
        {_transfer_query()}
        WHERE t.transfer_id = :transfer_id
    """), {"transfer_id": transfer_id}).fetchone()

    # If approved, move the inmate to the destination prison
    if updates.get("status") == "Approved":
        db.execute(text("""
            UPDATE inmate
            SET assigned_prison = :destination_prison,
                assigned_cell = NULL
            WHERE inmate_id = :inmate_id
        """), {
            "destination_prison": updated_transfer.destination_prison,
            "inmate_id": updated_transfer.inmate_id
        })
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
