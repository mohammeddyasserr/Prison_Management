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
        d.inmate_id,
        d.incident_id,
        CAST(d.imposed_by AS TEXT)                          AS imposed_by,
        d.punishment_type,
        d.solitary_days,
        d.date_imposed,
        DATE(d.date_imposed, '+' || COALESCE(d.solitary_days, 0) || ' days') AS end_date,
        d.notes,
        im.full_name                                        AS inmate_name,
        im.assigned_prison                                  AS prison_id,
        o.name                                              AS officer_name
    FROM disciplinary_log d
    LEFT JOIN inmate  im ON im.inmate_id  = d.inmate_id
    LEFT JOIN officer o  ON o.national_id = d.imposed_by
"""
 
 
def get_log_or_404(inmate_id: int, imposed_by: str, incident_id: int | None, db):
    if incident_id is not None:
        condition = "WHERE d.inmate_id = :inmate_id AND d.imposed_by = :imposed_by AND d.incident_id = :incident_id"
        params = {"inmate_id": inmate_id, "imposed_by": imposed_by, "incident_id": incident_id}
    else:
        condition = "WHERE d.inmate_id = :inmate_id AND d.imposed_by = :imposed_by AND d.incident_id IS NULL"
        params = {"inmate_id": inmate_id, "imposed_by": imposed_by}
 
    record = db.execute(text(f"{BASE_SELECT} {condition}"), params).fetchone()
 
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disciplinary log not found"
        )
    return record


# ------------------------------get all disciplinary logs ---------------------------------------------
@router.get("", response_model=list[schemas.DisciplinaryResponse], status_code=status.HTTP_200_OK, summary="Get all disciplinary logs")
def get_all_disciplinary(db: SessionDep, prison_id: int | None = None):
    if prison_id:
        records = db.execute(text(f"""
            {BASE_SELECT}
            WHERE im.assigned_prison = :prison_id
            ORDER BY d.date_imposed DESC
        """), {"prison_id": prison_id}).fetchall()
    else:
        records = db.execute(text(f"""
            {BASE_SELECT}
            ORDER BY d.date_imposed DESC
        """)).fetchall()
    return records

# ------------------------------get disciplinary logs for a specific inmate ---------------------------------------------
@router.get("/inmate/{inmate_id}", response_model=list[schemas.DisciplinaryResponse], status_code=status.HTTP_200_OK, summary="Get all disciplinary logs for a specific inmate")
def get_disciplinary_by_inmate(inmate_id: int, db: SessionDep):
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
    """), {"inmate_id": inmate_id}).fetchall()
    return records



# ------------------------------get disciplinary logs for a specific incident ---------------------------------------------
@router.get("/incident/{incident_id}", response_model=list[schemas.DisciplinaryResponse], status_code=status.HTTP_200_OK, summary="Get all disciplinary logs for a specific incident")
def get_disciplinary_by_incident(incident_id: int, db: SessionDep):
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
    """), {"incident_id": incident_id}).fetchall()
    return records
 


# ------------------------------create a new disciplinary log ---------------------------------------------
@router.post("", response_model=schemas.DisciplinaryResponse, status_code=status.HTTP_201_CREATED)
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
        request.solitary_days = None
 
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
        "inmate_id":       request.inmate_id,
        "incident_id":     request.incident_id,
        "imposed_by":      request.imposed_by,
        "punishment_type": request.punishment_type,
        "solitary_days":   request.solitary_days,
        "date_imposed":    request.date_imposed,
        "notes":           request.notes,
    })
 
    db.commit()
    return get_log_or_404(request.inmate_id, request.imposed_by, request.incident_id, db)


# ----------------------update an existing disciplinary log--------------------------------
@router.put("", response_model=schemas.DisciplinaryResponse, status_code=status.HTTP_200_OK)
def update_disciplinary(request: schemas.DisciplinaryUpdate, db: SessionDep):
    if request.incident_id is not None:
        condition = "inmate_id = :inmate_id AND imposed_by = :imposed_by AND incident_id = :incident_id"
        pk_params = {"inmate_id": request.inmate_id, "imposed_by": request.imposed_by, "incident_id": request.incident_id}
    else:
        condition = "inmate_id = :inmate_id AND imposed_by = :imposed_by AND incident_id IS NULL"
        pk_params = {"inmate_id": request.inmate_id, "imposed_by": request.imposed_by}
 
    existing = db.execute(
        text(f"SELECT 1 FROM disciplinary_log WHERE {condition}"), pk_params
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Disciplinary log not found")
 
    update_data = request.model_dump(
        exclude_unset=True,
        exclude={"inmate_id", "imposed_by", "incident_id"}
    )
 
    if update_data:
        set_clause = ", ".join(f"{k} = :{k}" for k in update_data.keys())
        db.execute(text(f"""
            UPDATE disciplinary_log
            SET {set_clause}
            WHERE {condition}
        """), {**update_data, **pk_params})
 
    db.commit()
    return get_log_or_404(request.inmate_id, request.imposed_by, request.incident_id, db)


# -------------------------delete a disciplinary log---------------------------------
@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_disciplinary(
    inmate_id: int,
    imposed_by: str,
    db: SessionDep,
    incident_id: int | None = None,
):
    if incident_id is not None:
        condition = "inmate_id = :inmate_id AND imposed_by = :imposed_by AND incident_id = :incident_id"
        params = {"inmate_id": inmate_id, "imposed_by": imposed_by, "incident_id": incident_id}
    else:
        condition = "inmate_id = :inmate_id AND imposed_by = :imposed_by AND incident_id IS NULL"
        params = {"inmate_id": inmate_id, "imposed_by": imposed_by}
 
    existing = db.execute(
        text(f"SELECT 1 FROM disciplinary_log WHERE {condition}"), params
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Disciplinary log not found")
 
    db.execute(text(f"DELETE FROM disciplinary_log WHERE {condition}"), params)
    db.commit()


# =========================================================================
# get disciplinary logs imposed by a specific officer
#NOT SUREEEE IF THIS SHOULD BE BY OFFICER OR MANAGER OR SUPERADMIN :( 

@router.get("/officer/{national_id}", response_model=list[schemas.DisciplinaryResponse], status_code=status.HTTP_200_OK, summary="Get all disciplinary logs imposed by a specific officer")
def get_disciplinary_by_officer(national_id: str, db: SessionDep):
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
    """), {"national_id": national_id}).fetchall()
    return records