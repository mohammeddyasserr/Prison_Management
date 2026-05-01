from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlmodel import select, text
import schemas
import models
from database import SessionDep

router = APIRouter(
    prefix="/disciplinary",
   tags=["disciplinary"]
)

BASE_SELECT = """
    SELECT
        d.rowid                         AS log_id,
        d.inmate_id,
        d.incident_id,
        CAST(d.imposed_by AS TEXT)      AS imposed_by,
        d.punishment_type,
        d.solitary_days,
        d.date_imposed,
        d.notes,
        im.full_name                    AS inmate_name,
        o.name                          AS officer_name
    FROM disciplinary_log d
    LEFT JOIN inmate  im ON im.inmate_id  = d.inmate_id
    LEFT JOIN officer o  ON o.national_id = d.imposed_by
"""
 
 
def get_log_or_404(log_id: int, db):
    record = db.execute(text(f"""
        {BASE_SELECT}
        WHERE d.rowid = :log_id
    """), {"log_id": log_id}).fetchone()
 
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Disciplinary log with id {log_id} not found"
        )
    return record


# get all disciplinary logs
@router.get(
    "",
    response_model=list[schemas.DisciplinaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all disciplinary logs"
)
def get_all_disciplinary(
    db: SessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    records = db.execute(text(f"""
        {BASE_SELECT}
        ORDER BY d.date_imposed DESC
        LIMIT :limit OFFSET :skip
    """), {"limit": limit, "skip": skip}).fetchall()
 
    return records

# get disciplinary logs for a specific inmate
@router.get(
    "/inmate/{inmate_id}",
    response_model=list[schemas.DisciplinaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all disciplinary logs for a specific inmate"
)
def get_disciplinary_by_inmate(
    inmate_id: int,
    db: SessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    inmate = db.execute(
        text("SELECT inmate_id FROM inmate WHERE inmate_id = :id"),
        {"id": inmate_id}
    ).fetchone()
    if not inmate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Inmate with id {inmate_id} not found")
 
    records = db.execute(text(f"""
        {BASE_SELECT}
        WHERE d.inmate_id = :inmate_id
        ORDER BY d.date_imposed DESC
        LIMIT :limit OFFSET :skip
    """), {"inmate_id": inmate_id, "limit": limit, "skip": skip}).fetchall()
 
    return records


# get disciplinary logs for a specific incident
@router.get(
    "/incident/{incident_id}",
    response_model=list[schemas.DisciplinaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all disciplinary logs linked to a specific incident"
)
def get_disciplinary_by_incident(
    incident_id: int,
    db: SessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    incident = db.execute(
        text("SELECT incident_id FROM incident WHERE incident_id = :id"),
        {"id": incident_id}
    ).fetchone()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Incident with id {incident_id} not found")
 
    records = db.execute(text(f"""
        {BASE_SELECT}
        WHERE d.incident_id = :incident_id
        ORDER BY d.date_imposed DESC
        LIMIT :limit OFFSET :skip
    """), {"incident_id": incident_id, "limit": limit, "skip": skip}).fetchall()
 
    return records
 
# get a single disciplinary log by ID
@router.get(
    "/{log_id}",
    response_model=schemas.DisciplinaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a single disciplinary log by ID"
)
def get_disciplinary(log_id: int, db: SessionDep):
    return get_log_or_404(log_id, db)



# create a new disciplinary log
@router.post(
    "",
    response_model=schemas.DisciplinaryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new disciplinary log"
)
def create_disciplinary(request: schemas.DisciplinaryCreate, db: SessionDep):
    # Validate inmate
    inmate = db.execute(
        text("SELECT inmate_id FROM inmate WHERE inmate_id = :id"),
        {"id": request.inmate_id}
    ).fetchone()
    if not inmate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Inmate {request.inmate_id} not found")
 
    # Validate officer
    officer = db.execute(
        text("SELECT national_id FROM officer WHERE national_id = :id"),
        {"id": request.imposed_by}
    ).fetchone()
    if not officer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Officer {request.imposed_by} not found")
 
    # Validate incident if provided
    if request.incident_id:
        incident = db.execute(
            text("SELECT incident_id FROM incident WHERE incident_id = :id"),
            {"id": request.incident_id}
        ).fetchone()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Incident {request.incident_id} not found")
 
    # Validate solitary_days
    if request.punishment_type == "Solitary Confinement":
        if not request.solitary_days or not (1 <= request.solitary_days <= 30):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="solitary_days must be between 1 and 30 for Solitary Confinement")
    else:
        request.solitary_days = None   # force null for non-solitary punishments
 
    db.execute(text("""
        INSERT INTO disciplinary_log (
            inmate_id, incident_id, imposed_by,
            punishment_type, solitary_days,
            date_imposed, notes
        ) VALUES (
            :inmate_id, :incident_id, :imposed_by,
            :punishment_type, :solitary_days,
            :date_imposed, :notes
        )
    """), {
        "inmate_id":      request.inmate_id,
        "incident_id":    request.incident_id,
        "imposed_by":     request.imposed_by,
        "punishment_type": request.punishment_type,
        "solitary_days":  request.solitary_days,
        "date_imposed":   request.date_imposed,
        "notes":          request.notes,
    })
 
    db.commit()
 
    new_id = db.execute(text("SELECT last_insert_rowid()")).scalar()
    return get_log_or_404(new_id, db)


# update an existing disciplinary log
@router.put(
    "/{log_id}",
    response_model=schemas.DisciplinaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a disciplinary log"
)
def update_disciplinary(log_id: int, request: schemas.DisciplinaryUpdate, db: SessionDep):
    existing = db.execute(
        text("SELECT rowid FROM disciplinary_log WHERE rowid = :id"),
        {"id": log_id}
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Disciplinary log {log_id} not found")
 
    update_data = request.model_dump(exclude_unset=True)
 
    if update_data:
        set_clause = ", ".join(f"{k} = :{k}" for k in update_data.keys())
        update_data["log_id"] = log_id
        db.execute(text(f"""
            UPDATE disciplinary_log
            SET {set_clause}
            WHERE rowid = :log_id
        """), update_data)
 
    db.commit()
    return get_log_or_404(log_id, db)


# delete a disciplinary log
@router.delete(
    "/{log_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a disciplinary log"
)
def delete_disciplinary(log_id: int, db: SessionDep):
    existing = db.execute(
        text("SELECT rowid FROM disciplinary_log WHERE rowid = :id"),
        {"id": log_id}
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Disciplinary log {log_id} not found")
 
    db.execute(text("DELETE FROM disciplinary_log WHERE rowid = :id"), {"id": log_id})
    db.commit()


# =========================================================================
# get disciplinary logs imposed by a specific officer
#NOT SUREEEE IF THIS SHOULD BE BY OFFICER OR MANAGER OR SUPERADMIN :( 

@router.get(
    "/officer/{national_id}",
    response_model=list[schemas.DisciplinaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all disciplinary logs imposed by a specific officer"
)
def get_disciplinary_by_officer(
    national_id: str,
    db: SessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    officer = db.execute(
        text("SELECT national_id FROM officer WHERE national_id = :id"),
        {"id": national_id}
    ).fetchone()
    if not officer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Officer with national_id {national_id} not found")
 
    records = db.execute(text(f"""
        {BASE_SELECT}
        WHERE d.imposed_by = :national_id
        ORDER BY d.date_imposed DESC
        LIMIT :limit OFFSET :skip
    """), {"national_id": national_id, "limit": limit, "skip": skip}).fetchall()
 
    return records