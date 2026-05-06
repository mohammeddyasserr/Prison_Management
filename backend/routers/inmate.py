from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import text
import schemas
from database import SessionDep

router = APIRouter(
    prefix="/inmates",
    tags=["inmates"]
)

@router.get("", response_model=list[schemas.InmateResponse], status_code=status.HTTP_200_OK)
def get_all(db: SessionDep):
    inmates = db.execute(text("""
        SELECT * FROM (
            SELECT 
                i.inmate_id,
                i.national_id,
                i.full_name,
                i.date_of_birth,
                i.gender,
                i.nationality,
                i.occupation,
                i.start_date,
                i.education_level,
                i.assigned_cell,
                i.assigned_prison,
                CASE 
                    WHEN i.status = 'Active' AND date('now') > date(i.start_date, 
                         '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                         '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                         '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') 
                    THEN 'To be released'
                    ELSE i.status 
                END as status,
                p.name as prison_name,
                date(i.start_date, 
                     '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                     '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                     '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date
            FROM inmate i
            LEFT JOIN cell c ON i.assigned_cell = c.cell_id
            LEFT JOIN block b ON c.block_id = b.block_id
            LEFT JOIN prison p ON b.prison_id = p.prison_id
            LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
            GROUP BY i.inmate_id

            UNION ALL

            SELECT
                pi.pending_inmate_id as inmate_id,
                pi.national_id,
                pi.full_name,
                pi.date_of_birth,
                pi.gender,
                pi.nationality,
                pi.occupation,
                pi.start_date,
                pi.education_level,
                NULL as assigned_cell,
                pi.assigned_prison,
                'Pending' as status,
                p.name as prison_name,
                NULL as release_date
            FROM pending_inmate pi
            LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
        )
        ORDER BY status, full_name
    """)).fetchall()
    
    return [dict(row._mapping) for row in inmates]

@router.get("/{inmate_id}", response_model=schemas.InmateResponse, status_code=status.HTTP_200_OK)
def get_inmate(inmate_id: int, db: SessionDep):
    result = db.execute(text("""
        SELECT * FROM (
            SELECT 
                i.inmate_id,
                i.national_id,
                i.full_name,
                i.date_of_birth,
                i.gender,
                i.nationality,
                i.occupation,
                i.start_date,
                i.education_level,
                i.assigned_cell,
                i.assigned_prison,
                CASE 
                    WHEN i.status = 'Active' AND date('now') > date(i.start_date, 
                         '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                         '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                         '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') 
                    THEN 'To be released'
                    ELSE i.status 
                END as status,
                p.name as prison_name,
                date(i.start_date, 
                     '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                     '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                     '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date
            FROM inmate i
            LEFT JOIN cell c ON i.assigned_cell = c.cell_id
            LEFT JOIN block b ON c.block_id = b.block_id
            LEFT JOIN prison p ON b.prison_id = p.prison_id
            LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
            GROUP BY i.inmate_id

            UNION ALL

            SELECT
                pi.pending_inmate_id as inmate_id,
                pi.national_id,
                pi.full_name,
                pi.date_of_birth,
                pi.gender,
                pi.nationality,
                pi.occupation,
                pi.start_date,
                pi.education_level,
                NULL as assigned_cell,
                pi.assigned_prison,
                'Pending' as status,
                p.name as prison_name,
                NULL as release_date
            FROM pending_inmate pi
            LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
        )
        WHERE inmate_id = :inmate_id
    """), {"inmate_id": inmate_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Inmate not found")

    return dict(result._mapping)

@router.get("/national_id/{national_id}", response_model=schemas.InmateResponse, status_code=status.HTTP_200_OK)
def get_inmate_by_national_id(national_id: str, db: SessionDep):
    result = db.execute(text("""
        SELECT * FROM (
            SELECT 
                i.inmate_id,
                i.national_id,
                i.full_name,
                i.date_of_birth,
                i.gender,
                i.nationality,
                i.occupation,
                i.start_date,
                i.education_level,
                i.assigned_cell,
                i.assigned_prison,
                CASE 
                    WHEN i.status = 'Active' AND date('now') > date(i.start_date, 
                         '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                         '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                         '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') 
                    THEN 'To be released'
                    ELSE i.status 
                END as status,
                p.name as prison_name,
                date(i.start_date, 
                     '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                     '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                     '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date
            FROM inmate i
            LEFT JOIN cell c ON i.assigned_cell = c.cell_id
            LEFT JOIN block b ON c.block_id = b.block_id
            LEFT JOIN prison p ON b.prison_id = p.prison_id
            LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
            WHERE i.national_id = :national_id
            GROUP BY i.inmate_id

            UNION ALL

            SELECT
                pi.pending_inmate_id as inmate_id,
                pi.national_id,
                pi.full_name,
                pi.date_of_birth,
                pi.gender,
                pi.nationality,
                pi.occupation,
                pi.start_date,
                pi.education_level,
                NULL as assigned_cell,
                pi.assigned_prison,
                'Pending' as status,
                p.name as prison_name,
                NULL as release_date
            FROM pending_inmate pi
            LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
            WHERE pi.national_id = :national_id
        )
        LIMIT 1
    """), {"national_id": national_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Inmate not found")

    return dict(result._mapping)

@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.PendingInmateResponse)
def create_inmate(request: schemas.PendingInmateCreate, db: SessionDep):
    inmate_data = request.model_dump()
    
    result = db.execute(text("""
        INSERT INTO pending_inmate (
            national_id, full_name, date_of_birth, gender, nationality, 
            occupation, start_date, education_level, assigned_prison
        ) VALUES (
            :national_id, :full_name, :date_of_birth, :gender, :nationality, 
            :occupation, :start_date, :education_level, :assigned_prison
        ) RETURNING *
    """), inmate_data)
    
    inserted_pending_inmate = result.fetchone()
    pending_inmate_id = inserted_pending_inmate.pending_inmate_id
    
    # Fetch the full data with joins to return consistent response
    new_result = db.execute(text("""
        SELECT 
            pi.*,
            p.name as prison_name
        FROM pending_inmate pi
        LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
        WHERE pi.pending_inmate_id = :pending_inmate_id
    """), {"pending_inmate_id": pending_inmate_id}).fetchone()
    
    new_pending_inmate = dict(new_result._mapping)
    db.commit()
    return new_pending_inmate

@router.delete("/{inmate_id}/release", response_model=schemas.InmateResponse, status_code=status.HTTP_200_OK)
def release_inmate(inmate_id: int, db: SessionDep):
    # First, fetch the inmate with joins before deletion
    result = db.execute(text("""
        SELECT 
            i.*,
            CASE 
                WHEN i.status = 'Active' AND date('now') > date(i.start_date, 
                     '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                     '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                     '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') 
                THEN 'To be released'
                ELSE i.status 
            END as status,
            p.name as prison_name,
            date(i.start_date, 
                 '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                 '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                 '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date
        FROM inmate i
        LEFT JOIN cell c ON i.assigned_cell = c.cell_id
        LEFT JOIN block b ON c.block_id = b.block_id
        LEFT JOIN prison p ON b.prison_id = p.prison_id
        LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
        WHERE i.inmate_id = :inmate_id
        GROUP BY i.inmate_id
    """), {"inmate_id": inmate_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Inmate not found")
        
    inmate_dict = dict(result._mapping)
        
    db.execute(text("DELETE FROM legal_case WHERE inmate_id = :inmate_id"), {"inmate_id": inmate_id})
    db.execute(text("DELETE FROM inmate WHERE inmate_id = :inmate_id"), {"inmate_id": inmate_id})
    
    db.commit()
        
    return inmate_dict

@router.get("/prison/{prison_id}", response_model=list[schemas.InmateResponse], status_code=status.HTTP_200_OK)
def get_inmates_by_prison(prison_id: int, db: SessionDep):
    inmates = db.execute(text("""
        SELECT 
            i.*,
            CASE 
                WHEN i.status = 'Active' AND date('now') > date(i.start_date, 
                     '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                     '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                     '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') 
                THEN 'To be released'
                ELSE i.status 
            END as status,
            p.name as prison_name,
            date(i.start_date, 
                 '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                 '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                 '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date
        FROM inmate i
        LEFT JOIN cell c ON i.assigned_cell = c.cell_id
        LEFT JOIN block b ON c.block_id = b.block_id
        LEFT JOIN prison p ON b.prison_id = p.prison_id
        LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
        WHERE b.prison_id = :prison_id
        GROUP BY i.inmate_id
    """), {"prison_id": prison_id}).fetchall()
    
    return [dict(row._mapping) for row in inmates]

@router.get("/incident/{incident_id}", response_model=list[schemas.InmateResponse], status_code=status.HTTP_200_OK)
def get_inmates_by_incident(incident_id: int, db: SessionDep):
    inmates = db.execute(text("""
        SELECT 
            i.*,
            CASE 
                WHEN i.status = 'Active' AND date('now') > date(i.start_date, 
                     '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                     '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                     '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') 
                THEN 'To be released'
                ELSE i.status 
            END as status,
            p.name as prison_name,
            date(i.start_date, 
                 '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years', 
                 '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months', 
                 '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date
        FROM inmate i
        LEFT JOIN cell c ON i.assigned_cell = c.cell_id
        LEFT JOIN block b ON c.block_id = b.block_id
        LEFT JOIN prison p ON b.prison_id = p.prison_id
        LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
        WHERE i.inmate_id IN (
            SELECT inmate_id FROM incident WHERE incident_id = :incident_id
            UNION
            SELECT inmate_id FROM incident_involvement WHERE incident_id = :incident_id
        )
        GROUP BY i.inmate_id
    """), {"incident_id": incident_id}).fetchall()
    
    return [dict(row._mapping) for row in inmates]

@router.get("/manager/{manager_national_id}", response_model=list[schemas.InmateResponse], status_code=status.HTTP_200_OK)
def get_inmates_by_manager(manager_national_id: str, db: SessionDep):
    # First get the manager's prison
    prison_result = db.execute(text("""
        SELECT prison_id FROM prison WHERE manager_id = :manager_national_id
    """), {"manager_national_id": manager_national_id}).fetchone()

    if not prison_result:
        raise HTTPException(status_code=404, detail="Manager not found or not assigned to a prison")

    prison_id = prison_result[0]

    # Get all inmates (active and pending) for this prison
    inmates = db.execute(text("""
        SELECT * FROM (
            SELECT
                i.inmate_id,
                i.national_id,
                i.full_name,
                i.date_of_birth,
                i.gender,
                i.nationality,
                i.occupation,
                i.start_date,
                i.education_level,
                i.assigned_cell,
                i.assigned_prison,
                CASE
                    WHEN i.status = 'Active' AND date('now') > date(i.start_date,
                         '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years',
                         '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months',
                         '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days')
                    THEN 'To be released'
                    ELSE i.status
                END as status,
                p.name as prison_name,
                date(i.start_date,
                     '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years',
                     '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months',
                     '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') as release_date
            FROM inmate i
            LEFT JOIN cell c ON i.assigned_cell = c.cell_id
            LEFT JOIN block b ON c.block_id = b.block_id
            LEFT JOIN prison p ON b.prison_id = p.prison_id
            LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
            WHERE b.prison_id = :prison_id
            GROUP BY i.inmate_id

            UNION ALL

            SELECT
                pi.pending_inmate_id as inmate_id,
                pi.national_id,
                pi.full_name,
                pi.date_of_birth,
                pi.gender,
                pi.nationality,
                pi.occupation,
                pi.start_date,
                pi.education_level,
                NULL as assigned_cell,
                pi.assigned_prison,
                'Pending' as status,
                p.name as prison_name,
                NULL as release_date
            FROM pending_inmate pi
            LEFT JOIN prison p ON pi.assigned_prison = p.prison_id
            WHERE pi.assigned_prison = :prison_id
        )
        ORDER BY status, full_name
    """), {"prison_id": prison_id}).fetchall()

    return [dict(row._mapping) for row in inmates]