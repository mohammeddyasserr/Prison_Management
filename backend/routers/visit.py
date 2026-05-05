from fastapi import APIRouter, status, HTTPException
from sqlmodel import text
import schemas
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
    timeslots = db.execute(text("SELECT * FROM timeslot")).fetchall()
    return timeslots


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
            v.timeslot_id,
            i.full_name  AS inmate_name,
            vis.full_name AS visitor_name,
            v.status,
            v.denial_reason
        FROM visit v
        JOIN inmate  i   ON i.inmate_id   = v.inmate_id
        JOIN visitor vis ON vis.national_id = v.visitor_id
    """


@router.get("", response_model=list[schemas.VisitResponse], status_code=status.HTTP_200_OK)
def get_all_visits(db: SessionDep):
    visits = db.execute(text(_visit_query())).fetchall()
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
    # Validate inmate exists
    inmate = db.execute(text("SELECT inmate_id FROM inmate WHERE inmate_id = :id"),
                        {"id": request.inmate_id}).fetchone()
    if not inmate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Inmate with id {request.inmate_id} not found")

    # Validate visitor exists
    visitor = db.execute(text("SELECT national_id FROM visitor WHERE national_id = :id"),
                         {"id": request.visitor_id}).fetchone()
    if not visitor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Visitor with national_id {request.visitor_id} not found")

    # Validate timeslot exists
    timeslot = db.execute(text("SELECT timeslot_id FROM timeslot WHERE timeslot_id = :id"),
                          {"id": request.timeslot_id}).fetchone()
    if not timeslot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Timeslot with id {request.timeslot_id} not found")

    result = db.execute(text("""
        INSERT INTO visit (visit_type, visit_date, timeslot_id, inmate_id, visitor_id)
        VALUES (:visit_type, :visit_date, :timeslot_id, :inmate_id, :visitor_id)
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
            # You might want to log this error instead of failing the request
            pass
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
