from fastapi import APIRouter, status, HTTPException
from sqlmodel import text
import schemas
from database import SessionDep

router = APIRouter(
    prefix="/visit",
    tags=["visit"]
)


@router.get("", response_model=list[schemas.VisitResponse], status_code=status.HTTP_200_OK)
def get_all_visits(db: SessionDep):
    visits = db.execute(text("""
        SELECT *
        FROM visit
    """)).fetchall()
    return visits


@router.get("/{visit_id}", response_model=schemas.VisitResponse, status_code=status.HTTP_200_OK)
def get_visit(visit_id: int, db: SessionDep):
    visit = db.execute(text("""
        SELECT *
        FROM visit
        WHERE visit_id = :visit_id
    """), {"visit_id": visit_id}).fetchone()

    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Visit with id {visit_id} not found"
        )
    return visit


@router.post("", response_model=schemas.VisitResponse, status_code=status.HTTP_201_CREATED)
async def create_visit(request: schemas.VisitCreate, db: SessionDep):
    result = db.execute(text("""
        INSERT INTO visit (
            visit_type, visit_date, inmate_id,
            visitor_id, duration_minutes
        ) VALUES (
            :visit_type, :visit_date, :inmate_id,
            :visitor_id, :duration_minutes
        ) RETURNING *
    """), request.model_dump())

    new_visit = result.fetchone()
    db.commit()

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
    # Check the visit exists
    existing = db.execute(text("""
        SELECT * FROM visit WHERE visit_id = :visit_id
    """), {"visit_id": visit_id}).fetchone()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Visit with id {visit_id} not found"
        )

    # Build a dynamic SET clause for only the provided fields
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    if not updates:
        return existing

    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["visit_id"] = visit_id

    result = db.execute(text(f"""
        UPDATE visit
        SET {set_clause}
        WHERE visit_id = :visit_id
        RETURNING *
    """), updates)

    updated_visit = result.fetchone()
    db.commit()
    return updated_visit


@router.delete("/{visit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_visit(visit_id: int, db: SessionDep):
    existing = db.execute(text("""
        SELECT visit_id FROM visit WHERE visit_id = :visit_id
    """), {"visit_id": visit_id}).fetchone()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Visit with id {visit_id} not found"
        )

    db.execute(text("""
        DELETE FROM visit WHERE visit_id = :visit_id
    """), {"visit_id": visit_id})
    db.commit()
