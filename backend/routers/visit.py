from fastapi import APIRouter, status, HTTPException
from sqlmodel import text
import schemas.prison
import schemas.block
import schemas.cell
import schemas.inmate
import schemas.visit
import schemas.legal_case
from database import SessionDep

router = APIRouter(
    prefix="/visit",
    tags=["visit"]
)


# ---------------------------------------------------------------------------
# Visitor endpoints
# ---------------------------------------------------------------------------

@router.post("/visitor", response_model=schemas.VisitorResponse, status_code=status.HTTP_201_CREATED)
def create_visitor(request: schemas.VisitorCreate, db: SessionDep):
    existing = db.execute(text("""
        SELECT national_id FROM visitor WHERE national_id = :national_id
    """), {"national_id": request.national_id}).fetchone()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Visitor with national_id {request.national_id} already exists"
        )

    result = db.execute(text("""
        INSERT INTO visitor (national_id, full_name, relationship, phone, email)
        VALUES (:national_id, :full_name, :relationship, :phone, :email)
        RETURNING *
    """), request.model_dump())

    new_visitor = result.fetchone()
    db.commit()
    return new_visitor


@router.get("/visitor/{national_id}", response_model=schemas.VisitorResponse, status_code=status.HTTP_200_OK)
def get_visitor(national_id: str, db: SessionDep):
    visitor = db.execute(text("""
        SELECT *
        FROM visitor
        WHERE national_id = :national_id
    """), {"national_id": national_id}).fetchone()

    if not visitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Visitor with national_id {national_id} not found"
        )
    return visitor


@router.get("/timeslots", response_model=list[schemas.TimeslotResponse], status_code=status.HTTP_200_OK)
def get_timeslots(db: SessionDep):
    timeslots = db.execute(text("SELECT * FROM timeslot WHERE date >= CURRENT_DATE ORDER BY date, start_time")).fetchall()
    return timeslots


@router.post("/timeslots", response_model=schemas.TimeslotResponse, status_code=status.HTTP_201_CREATED)
def create_timeslot(request: schemas.visit.TimeslotCreate, db: SessionDep):
    req_dict = request.model_dump()
    req_dict["date"] = str(req_dict["date"])
    req_dict["start_time"] = str(req_dict["start_time"])
    req_dict["end_time"] = str(req_dict["end_time"])

    existing = db.execute(text("""
        SELECT * FROM timeslot WHERE date = :date AND start_time = :start_time AND end_time = :end_time
    """), req_dict).fetchone()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Timeslot already exists"
        )

    result = db.execute(text("""
        INSERT INTO timeslot (date, start_time, end_time)
        VALUES (:date, :start_time, :end_time)
        RETURNING *
    """), req_dict)

    new_timeslot = result.fetchone()
    db.commit()
    return new_timeslot


@router.delete("/timeslots/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timeslot(slot_id: int, db: SessionDep):
    existing = db.execute(text("SELECT slot_id FROM timeslot WHERE slot_id = :slot_id"),
                          {"slot_id": slot_id}).fetchone()
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Timeslot with id {slot_id} not found"
        )

    db.execute(text("DELETE FROM timeslot WHERE slot_id = :slot_id"), {"slot_id": slot_id})
    db.commit()


@router.get("/timeslots/dates", response_model=list[str], status_code=status.HTTP_200_OK)
def get_timeslot_dates(db: SessionDep):
    dates = db.execute(text("SELECT DISTINCT date FROM timeslot WHERE date >= CURRENT_DATE ORDER BY date")).fetchall()
    # fetchall returns a list of tuples like [('2026-05-06',), ('2026-05-07',)]
    return [d[0] for d in dates]


# ---------------------------------------------------------------------------
# Visit endpoints
# ---------------------------------------------------------------------------

def _visit_query() -> str:
    """Base SELECT that resolves inmate_name and visitor_name."""
    return """
        SELECT
            v.visit_id,
            v.visit_type,
            v.visit_date,
            i.full_name  AS inmate_name,
            vis.full_name AS visitor_name,
            v.status,
            v.denial_reason
        FROM visit v
        JOIN inmate  i   ON i.inmate_id   = v.inmate_id
        JOIN visitor vis ON vis.national_id = v.visitor_id
    """


@router.get("", response_model=list[schemas.VisitResponse], status_code=status.HTTP_200_OK)
def get_all_visits(db: SessionDep, prison_id: int | None = None):
    base_query = _visit_query()
    if prison_id:
        base_query += " WHERE i.assigned_prison = :prison_id"
        visits = db.execute(text(base_query), {"prison_id": prison_id}).fetchall()
    else:
        visits = db.execute(text(base_query)).fetchall()
    return visits


@router.get("/{visit_id}", response_model=schemas.VisitResponse, status_code=status.HTTP_200_OK)
def get_visit(visit_id: int, db: SessionDep):
    visit = db.execute(text(f"""
        {_visit_query()}
        WHERE v.visit_id = :visit_id
    """), {"visit_id": visit_id}).fetchone()

    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Visit with id {visit_id} not found"
        )
    return visit


@router.post("", response_model=schemas.VisitResponse, status_code=status.HTTP_201_CREATED)
async def create_visit(request: schemas.VisitCreate, db: SessionDep):
    # Validate inmate exists and is not released
    inmate = db.execute(text("""
        SELECT status FROM inmate WHERE inmate_id = :id
        UNION ALL
        SELECT status FROM pending_inmate WHERE pending_inmate_id = :id
    """), {"id": request.inmate_id}).fetchone()
    if not inmate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Inmate with id {request.inmate_id} not found")
    if inmate[0] == 'Released':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Inmate {request.inmate_id} has been released and cannot receive visits")

    # Validate visitor exists
    visitor = db.execute(text("SELECT national_id FROM visitor WHERE national_id = :id"),
                         {"id": request.visitor_id}).fetchone()
    if not visitor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Visitor with national_id {request.visitor_id} not found")

    # Validate timeslot exists
    timeslot = db.execute(text("SELECT date FROM timeslot WHERE date = :date"),
                          {"date": request.visit_date}).fetchone()
    if not timeslot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Timeslot with date {request.visit_date} not found")

    result = db.execute(text("""
        INSERT INTO visit (visit_type, visit_date, inmate_id, visitor_id)
        VALUES (:visit_type, :visit_date, :inmate_id, :visitor_id)
        RETURNING visit_id
    """), request.model_dump())

    new_id = result.fetchone()[0]
    db.commit()
    new_visit = db.execute(text(f"""
        {_visit_query()}
        WHERE v.visit_id = :visit_id
    """), {"visit_id": new_id}).fetchone()
    
    
    # Get visitor email and name
    visitor_info = db.execute(text("""
        SELECT email, full_name FROM visitor WHERE national_id = :visitor_id
    """), {"visitor_id": request.visitor_id}).fetchone()

    inmate_info = db.execute(text("""
        SELECT full_name FROM inmate WHERE inmate_id = :inmate_id
    """), {"inmate_id": request.inmate_id}).fetchone()

    # Get the prison name (assuming one primary prison facility for the system or getting the first)
    prison_info = db.execute(text("""
        SELECT name FROM prison LIMIT 1
    """)).fetchone()
    prison_name = prison_info.name if prison_info else "Central Prison"

    if visitor_info and visitor_info.email and inmate_info:
        from email_service import visit_requested_email
        try:
            await visit_requested_email(
                email=visitor_info.email,
                visitor_name=visitor_info.full_name,
                inmate_name=inmate_info.full_name,
                visit_date=str(request.visit_date),
                prison_name=prison_name
            )
        except Exception as e:
            import logging
            logging.error(f"Failed to send visit request email: {e}")
    return new_visit


@router.put("/{visit_id}", response_model=schemas.VisitResponse, status_code=status.HTTP_200_OK)
def update_visit(visit_id: int, request: schemas.VisitUpdate, db: SessionDep):
    existing = db.execute(text("SELECT visit_id FROM visit WHERE visit_id = :visit_id"),
                          {"visit_id": visit_id}).fetchone()
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Visit with id {visit_id} not found"
        )

    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if updates:
        set_clause = ", ".join(f"{k} = :{k}" for k in updates)
        updates["visit_id"] = visit_id
        db.execute(text(f"""
            UPDATE visit
            SET {set_clause}
            WHERE visit_id = :visit_id
        """), updates)
        db.commit()

    updated_visit = db.execute(text(f"""
        {_visit_query()}
        WHERE v.visit_id = :visit_id
    """), {"visit_id": visit_id}).fetchone()

    return updated_visit


@router.delete("/{visit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_visit(visit_id: int, db: SessionDep):
    existing = db.execute(text("SELECT visit_id FROM visit WHERE visit_id = :visit_id"),
                          {"visit_id": visit_id}).fetchone()
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Visit with id {visit_id} not found"
        )

    db.execute(text("DELETE FROM visit WHERE visit_id = :visit_id"), {"visit_id": visit_id})
    db.commit()


@router.patch("/{visit_id}/confirm", response_model=schemas.VisitResponse, status_code=status.HTTP_200_OK)
async def confirm_visit(visit_id: int, db: SessionDep):
    existing = db.execute(text("SELECT visit_id, visitor_id, inmate_id, visit_date FROM visit WHERE visit_id = :visit_id"),
                          {"visit_id": visit_id}).fetchone()
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Visit with id {visit_id} not found"
        )
        
    db.execute(text("""
        UPDATE visit
        SET status = 'Approved', denial_reason = NULL
        WHERE visit_id = :visit_id
    """), {"visit_id": visit_id})
    db.commit()

    updated_visit = db.execute(text(f"""
        {_visit_query()}
        WHERE v.visit_id = :visit_id
    """), {"visit_id": visit_id}).fetchone()

    # Send confirmation email
    visitor_info = db.execute(text("SELECT email, full_name FROM visitor WHERE national_id = :visitor_id"), 
                              {"visitor_id": existing.visitor_id}).fetchone()
    inmate_info = db.execute(text("SELECT full_name FROM inmate WHERE inmate_id = :inmate_id"), 
                             {"inmate_id": existing.inmate_id}).fetchone()
    timeslot_info = db.execute(text("SELECT start_time, end_time FROM timeslot WHERE date = :date"),
                               {"date": existing.visit_date}).fetchone()

    prison_info = db.execute(text("SELECT name FROM prison LIMIT 1")).fetchone()
    prison_name = prison_info.name if prison_info else "Central Prison"

    if visitor_info and visitor_info.email and inmate_info and timeslot_info:
        from email_service import visit_confirmed_email
        try:
            visit_time = f"{timeslot_info.start_time} - {timeslot_info.end_time}"
            await visit_confirmed_email(
                email=visitor_info.email,
                visitor_name=visitor_info.full_name,
                inmate_name=inmate_info.full_name,
                visit_date=str(existing.visit_date),
                visit_time=visit_time,
                prison_name=prison_name
            )
        except Exception as e:
            import logging
            logging.error(f"Failed to send visit confirmation email: {e}")

    return updated_visit


@router.patch("/{visit_id}/reject", response_model=schemas.VisitResponse, status_code=status.HTTP_200_OK)
async def reject_visit(visit_id: int, request: schemas.RejectVisitRequest, db: SessionDep):
    existing = db.execute(text("SELECT visit_id, visitor_id, inmate_id FROM visit WHERE visit_id = :visit_id"),
                          {"visit_id": visit_id}).fetchone()
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Visit with id {visit_id} not found"
        )
        
    db.execute(text("""
        UPDATE visit
        SET status = 'Denied', denial_reason = :denial_reason
        WHERE visit_id = :visit_id
    """), {"visit_id": visit_id, "denial_reason": request.denial_reason})
    db.commit()

    updated_visit = db.execute(text(f"""
        {_visit_query()}
        WHERE v.visit_id = :visit_id
    """), {"visit_id": visit_id}).fetchone()

    # Send rejection email
    visitor_info = db.execute(text("SELECT email, full_name FROM visitor WHERE national_id = :visitor_id"), 
                              {"visitor_id": existing.visitor_id}).fetchone()
    inmate_info = db.execute(text("SELECT full_name FROM inmate WHERE inmate_id = :inmate_id"), 
                             {"inmate_id": existing.inmate_id}).fetchone()
    
    prison_info = db.execute(text("SELECT name FROM prison LIMIT 1")).fetchone()
    prison_name = prison_info.name if prison_info else "Central Prison"

    if visitor_info and visitor_info.email and inmate_info:
        from email_service import visit_rejected_email
        try:
            await visit_rejected_email(
                email=visitor_info.email,
                visitor_name=visitor_info.full_name,
                inmate_name=inmate_info.full_name,
                prison_name=prison_name,
                reason=request.denial_reason
            )
        except Exception as e:
            import logging
            logging.error(f"Failed to send visit rejection email: {e}")

    return updated_visit

