from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlmodel import select, text
import schemas
import models
from database import SessionDep

router = APIRouter(
    prefix="/incidents",
   tags=["incidents"]

)

BASE_SELECT = """
    SELECT
        i.incident_id,
        i.type,
        i.occurred_at,
        i.description,
        i.action_taken,
        i.block_id,
        b.security_level                  AS block_security_level,
        p.prison_id,
        p.name                            AS prison_name,
        CAST(i.reporting_officer AS TEXT)  AS reporting_officer,
        o.name                            AS officer_name,
        (
            SELECT GROUP_CONCAT(inv.inmate_id)
            FROM incident_involvement inv
            WHERE inv.incident_id = i.incident_id
        )                                 AS involved_inmate_ids
    FROM incident i
    LEFT JOIN block   b  ON b.block_id    = i.block_id
    LEFT JOIN prison  p  ON p.prison_id   = b.prison_id
    LEFT JOIN officer o  ON o.national_id = i.reporting_officer
"""



# ------------------------------get all incidents----------------------------------------------
@router.get("", response_model=list[schemas.IncidentResponse], status_code=status.HTTP_200_OK)
def get_all_incidents(db: SessionDep):
    incidents = db.execute(text(f"""
        {BASE_SELECT}
        ORDER BY i.occurred_at DESC
    """)).fetchall()
    return incidents


# ------------------------------get incidents by reporting officer----------------------------------------------
@router.get("/officer/{national_id}", response_model=list[schemas.IncidentResponse], status_code=status.HTTP_200_OK, summary="Get all incidents reported by a specific officer")
def get_incidents_by_officer(national_id: str, db: SessionDep):
    officer = db.execute(
        text("SELECT national_id FROM officer WHERE national_id = :id"),
        {"id": national_id}
    ).fetchone()
    if not officer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Officer with national_id {national_id} not found")
 
    incidents = db.execute(text(f"""
        {BASE_SELECT}
        WHERE i.reporting_officer = :national_id
        ORDER BY i.occurred_at DESC
    """), {"national_id": national_id}).fetchall()
    return incidents


# ------------------------------get incidents by prison------------------------------------------
@router.get("/prison/{prison_id}", response_model=list[schemas.IncidentResponse], status_code=status.HTTP_200_OK, summary="Get all incidents that happened in a specific prison")
def get_incidents_by_prison(prison_id: int, db: SessionDep):
    prison = db.execute(
        text("SELECT prison_id FROM prison WHERE prison_id = :id"),
        {"id": prison_id}
    ).fetchone()
    if not prison:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Prison with id {prison_id} not found")
 
    incidents = db.execute(text(f"""
        {BASE_SELECT}
        WHERE b.prison_id = :prison_id
        ORDER BY i.occurred_at DESC
    """), {"prison_id": prison_id}).fetchall()
    return incidents



# -------------------------get incidents by block----------------------------------------
@router.get("/block/{block_id}", response_model=list[schemas.IncidentResponse], status_code=status.HTTP_200_OK, summary="Get all incidents that happened in a specific block")
def get_incidents_by_block(block_id: int, db: SessionDep):
    block = db.execute(
        text("SELECT block_id FROM block WHERE block_id = :id"),
        {"id": block_id}
    ).fetchone()
    if not block:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Block with id {block_id} not found")
 
    incidents = db.execute(text(f"""
        {BASE_SELECT}
        WHERE i.block_id = :block_id
        ORDER BY i.occurred_at DESC
    """), {"block_id": block_id}).fetchall()
    return incidents

#----------------------------get incidents by inmate--------------------------------------------
@router.get("/inmate/{inmate_id}", response_model=list[schemas.IncidentResponse], status_code=status.HTTP_200_OK, summary="Get all incidents for a specific inmate")
def get_incidents_by_inmate(inmate_id: int, db: SessionDep):
    inmate = db.execute(
        text("SELECT inmate_id FROM inmate WHERE inmate_id = :id"),
        {"id": inmate_id}
    ).fetchone()
    if not inmate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Inmate with id {inmate_id} not found")

    incidents = db.execute(text(f"""
        {BASE_SELECT}
        WHERE i.incident_id IN (
            SELECT incident_id FROM incident_involvement
            WHERE inmate_id = :inmate_id
        )
        ORDER BY i.occurred_at DESC
    """), {"inmate_id": inmate_id}).fetchall()
    return incidents


#------------------------get single incident by id--------------------------------
@router.get(
    "/{incident_id}",
    response_model=schemas.IncidentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a single incident by ID"
)
def get_incident(incident_id: int, db: SessionDep):
    incident = db.execute(text(f"""
        {BASE_SELECT}
        WHERE i.incident_id = :incident_id
    """), {"incident_id": incident_id}).fetchone()
 
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with id {incident_id} not found"
        )
 
    return incident



# -------------------------create new incident--------------------------------
@router.post("", response_model=schemas.IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(request: schemas.IncidentCreate, db: SessionDep):
    # Validate officer
    officer = db.execute(
        text("SELECT national_id FROM officer WHERE national_id = :id"),
        {"id": request.reporting_officer}
    ).fetchone()
    if not officer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Officer {request.reporting_officer} not found")

    # Validate block if provided
    if request.block_id:
        block = db.execute(
            text("SELECT block_id FROM block WHERE block_id = :id"),
            {"id": request.block_id}
        ).fetchone()
        if not block:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Block {request.block_id} not found")

    # Insert incident
    # We supply a fallback inmate_id (the first involved inmate) in case the DB still has the legacy NOT NULL constraint
    primary_inmate_id = request.involved_inmate_ids[0] if request.involved_inmate_ids else 1
    
    try:
        result = db.execute(text("""
            INSERT INTO incident (
                type, block_id, occurred_at,
                reporting_officer, description, action_taken, inmate_id
            ) VALUES (
                :type, :block_id, :occurred_at,
                :reporting_officer, :description, :action_taken, :inmate_id
            ) RETURNING incident_id
        """), {
            "type":              request.type,
            "block_id":          request.block_id,
            "occurred_at":       request.occurred_at,
            "reporting_officer": request.reporting_officer,
            "description":       request.description,
            "action_taken":      request.action_taken,
            "inmate_id":         primary_inmate_id,
        })
    except Exception as e:
        # Fallback if the column truly doesn't exist anymore
        result = db.execute(text("""
            INSERT INTO incident (
                type, block_id, occurred_at,
                reporting_officer, description, action_taken
            ) VALUES (
                :type, :block_id, :occurred_at,
                :reporting_officer, :description, :action_taken
            ) RETURNING incident_id
        """), {
            "type":              request.type,
            "block_id":          request.block_id,
            "occurred_at":       request.occurred_at,
            "reporting_officer": request.reporting_officer,
            "description":       request.description,
            "action_taken":      request.action_taken,
        })

    new_id = result.fetchone().incident_id

    # Insert all involved inmates into incident_involvement
    for iid in set(request.involved_inmate_ids):
        db.execute(text("""
            INSERT OR IGNORE INTO incident_involvement (incident_id, inmate_id)
            VALUES (:incident_id, :inmate_id)
        """), {"incident_id": new_id, "inmate_id": iid})

    db.commit()
    return get_incident(new_id, db)



# -------------------------update incident--------------------------------
@router.put(
    "/{incident_id}",
    response_model=schemas.IncidentResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an incident"
)
def update_incident(incident_id: int, request: schemas.IncidentUpdate, db: SessionDep):
    existing = db.execute(
        text("SELECT incident_id FROM incident WHERE incident_id = :id"),
        {"id": incident_id}
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Incident {incident_id} not found")
 
    # Build SET clause only from fields that were sent
    update_data = request.model_dump(exclude_unset=True, exclude={"involved_inmate_ids"})
 
    if update_data:
        set_clause = ", ".join(f"{col} = :{col}" for col in update_data.keys())
        update_data["incident_id"] = incident_id
        db.execute(text(f"""
            UPDATE incident SET {set_clause}
            WHERE incident_id = :incident_id
        """), update_data)
 
    # Replace involvement list if provided
    if request.involved_inmate_ids is not None:
        db.execute(
            text("DELETE FROM incident_involvement WHERE incident_id = :id"),
            {"id": incident_id}
        )
        for iid in set(request.involved_inmate_ids):
            db.execute(text("""
                INSERT OR IGNORE INTO incident_involvement (incident_id, inmate_id)
                VALUES (:incident_id, :inmate_id)
            """), {"incident_id": incident_id, "inmate_id": iid})
 
    db.commit()
 
    return get_incident(incident_id, db)


# -------------------------delete incident--------------------------------
@router.delete(
    "/{incident_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an incident"
)
def delete_incident(incident_id: int, db: SessionDep):
    existing = db.execute(
        text("SELECT incident_id FROM incident WHERE incident_id = :id"),
        {"id": incident_id}
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Incident {incident_id} not found")
 
    db.execute(text("DELETE FROM incident WHERE incident_id = :id"), {"id": incident_id})
    db.commit()