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
            COALESCE(i.full_name, pi.full_name) as inmate_name,
            p1.name as from_prison,
            p2.name as to_prison
        FROM transfer t
        LEFT JOIN inmate i ON t.inmate_id = i.inmate_id
        LEFT JOIN pending_inmate pi ON t.inmate_id = pi.pending_inmate_id
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


@router.put("/{transfer_id}/accept", response_model=schemas.TransferResponse, status_code=status.HTTP_200_OK)
def accept_transfer(transfer_id: int, request: schemas.TransferUpdate, db: SessionDep):
    existing = db.execute(text("""
        SELECT * FROM transfer WHERE transfer_id = :transfer_id
    """), {"transfer_id": transfer_id}).fetchone()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transfer with id {transfer_id} not found"
        )
    
    # Update transfer status to Approved and store approver details
    db.execute(text("""
        UPDATE transfer
        SET status = 'Approved',
            approved_by = :approved_by,
            approval_date = :approval_date
        WHERE transfer_id = :transfer_id
    """), {
        "transfer_id": transfer_id,
        "approved_by": request.approved_by,
        "approval_date": request.approval_date
    })

    inmate_id = existing.inmate_id
    destination_prison = existing.destination_prison

    # Fetch inmate data
    inmate_data = db.execute(text("""
        SELECT * FROM inmate WHERE inmate_id = :inmate_id
    """), {"inmate_id": inmate_id}).fetchone()

    if inmate_data:
        # Move to pending_inmate table keeping original ID
        db.execute(text("""
            INSERT INTO pending_inmate (
                pending_inmate_id, national_id, full_name, date_of_birth, gender,
                nationality, occupation, start_date, education_level,
                assigned_prison
            ) VALUES (
                :pending_inmate_id, :national_id, :full_name, :date_of_birth, :gender,
                :nationality, :occupation, :start_date, :education_level,
                :assigned_prison
            )
        """), {
            "pending_inmate_id": inmate_data.inmate_id,
            "national_id": inmate_data.national_id,
            "full_name": inmate_data.full_name,
            "date_of_birth": inmate_data.date_of_birth,
            "gender": inmate_data.gender,
            "nationality": inmate_data.nationality,
            "occupation": inmate_data.occupation,
            "start_date": inmate_data.start_date,
            "education_level": inmate_data.education_level,
            "assigned_prison": destination_prison
        })

        # Delete from inmate table
        db.execute(text("""
            DELETE FROM inmate WHERE inmate_id = :inmate_id
        """), {"inmate_id": inmate_id})

    db.commit()

    updated_transfer = db.execute(text(f"""
        {_transfer_query()}
        WHERE t.transfer_id = :transfer_id
    """), {"transfer_id": transfer_id}).fetchone()

    return updated_transfer


@router.put("/{transfer_id}/reject", response_model=schemas.TransferResponse, status_code=status.HTTP_200_OK)
def reject_transfer(transfer_id: int, request: schemas.TransferUpdate, db: SessionDep):
    existing = db.execute(text("""
        SELECT * FROM transfer WHERE transfer_id = :transfer_id
    """), {"transfer_id": transfer_id}).fetchone()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transfer with id {transfer_id} not found"
        )
    
    # Update transfer status to Denied
    db.execute(text("""
        UPDATE transfer
        SET status = 'Denied',
            approved_by = :approved_by,
            approval_date = :approval_date
        WHERE transfer_id = :transfer_id
    """), {
        "transfer_id": transfer_id,
        "approved_by": request.approved_by,
        "approval_date": request.approval_date
    })
    db.commit()

    updated_transfer = db.execute(text(f"""
        {_transfer_query()}
        WHERE t.transfer_id = :transfer_id
    """), {"transfer_id": transfer_id}).fetchone()

    return updated_transfer
