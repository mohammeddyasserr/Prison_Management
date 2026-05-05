from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import select, text
from schemas import staff
import models
from database import SessionDep


router = APIRouter(
    prefix="/staff",
   tags=["staff"]
)

@router.get("", response_model=list[staff.StaffResponse],status_code=status.HTTP_200_OK)
def get_all_staff(session: SessionDep):
    query =text("""
        SELECT 
            o.national_id, 
            o.name, 
            o.email, 
            o.phone, 
            CASE 
                WHEN p_mgr.manager_id IS NOT NULL THEN 'manager' 
                ELSE 'officer' 
            END as role,
            p.name as prison_name
        FROM officer o
        LEFT JOIN prison p ON o.prison_id = p.prison_id
        LEFT JOIN prison p_mgr ON o.national_id = p_mgr.manager_id
    """)
    result = session.exec(query).all()
    # SQLModel session.exec with text returns tuples if not mapped to a model directly.
    # To properly construct the response model we can use the field names.
    staff_list = []
    for row in result:
        staff_list.append(
            staff.StaffResponse(
                national_id=row[0],
                name=row[1],
                email=row[2],
                phone=row[3],
                role=row[4],
                prison_name=row[5]
            )
        )
    return staff_list

@router.get("/prison/{prison_id}", response_model=list[staff.StaffResponse], status_code=status.HTTP_200_OK)
def get_staff_by_prison(prison_id: int, session: SessionDep):
    query = text("""
        SELECT 
            o.national_id, 
            o.name, 
            o.email, 
            o.phone, 
            CASE 
                WHEN p_mgr.manager_id IS NOT NULL THEN 'manager' 
                ELSE 'officer' 
            END as role,
            p.name as prison_name
        FROM officer o
        LEFT JOIN prison p ON o.prison_id = p.prison_id
        LEFT JOIN prison p_mgr ON o.national_id = p_mgr.manager_id
        WHERE o.prison_id = :prison_id
    """).bindparams(prison_id=prison_id)
    
    result = session.exec(query).all()
    
    staff_list = []
    for row in result:
        staff_list.append(
            staff.StaffResponse(
                national_id=row[0],
                name=row[1],
                email=row[2],
                phone=row[3],
                role=row[4],
                prison_name=row[5]
            )
        )
    return staff_list

@router.get("/officers", response_model=list[staff.StaffResponse], status_code=status.HTTP_200_OK)
def get_non_manager_officers(session: SessionDep):
    query = text("""
        SELECT 
            o.national_id, 
            o.name, 
            o.email, 
            o.phone, 
            'officer' as role,
            p.name as prison_name
        FROM officer o
        LEFT JOIN prison p ON o.prison_id = p.prison_id
        LEFT JOIN prison p_mgr ON o.national_id = p_mgr.manager_id
        WHERE p_mgr.manager_id IS NULL
    """)
    
    result = session.exec(query).all()
    
    staff_list = []
    for row in result:
        staff_list.append(
            staff.StaffResponse(
                national_id=row[0],
                name=row[1],
                email=row[2],
                phone=row[3],
                role=row[4],
                prison_name=row[5]
            )
        )
    return staff_list


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_staff(staff_in: staff.StaffCreate, session: SessionDep):
    check_query = text("SELECT national_id FROM officer WHERE national_id = :nid OR email = :email")
    existing = session.exec(check_query.bindparams(nid=staff_in.national_id, email=staff_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Officer with this National ID or Email already exists")
    
    insert_query = text("""
        INSERT INTO officer (national_id, name, phone, address, email, password_hash, prison_id)
        VALUES (:national_id, :name, :phone, :address, :email, :password_hash, :prison_id)
    """).bindparams(
        national_id=staff_in.national_id,
        name=staff_in.name,
        phone=staff_in.phone,
        address=staff_in.address,
        email=staff_in.email,
        password_hash=staff_in.password_hash,
        prison_id=staff_in.prison_id
    )
    
    session.exec(insert_query)
    session.commit()
    return {"message": "Staff created successfully", "national_id": staff_in.national_id}



