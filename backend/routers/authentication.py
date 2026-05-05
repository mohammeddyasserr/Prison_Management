from typing import Annotated
from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import text
import schemas
from database import SessionDep
from oauth import get_user, verify_password, hash_password, get_current_active_user

router = APIRouter(
    prefix="/login",
   tags=["login"]
)

@router.post("/token", response_model=schemas.login.Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: SessionDep):
    user = get_user(db, form_data.username) # assuming username field gets email/id/phone
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    if not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    return {"access_token": user["national_id"], "token_type": "bearer", "role": user["role"], "name": user["name"]}


@router.post("/create_admin", status_code=status.HTTP_201_CREATED)
async def create_superadmin(admin_data: schemas.login.SuperAdminCreate, db: SessionDep):
    # Check if user already exists
    existing_user = db.exec(
        text("SELECT email FROM super_admin WHERE email = :email"),
        params={"email": admin_data.email}
    ).fetchone()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    existing_national_id = db.exec(
        text("SELECT national_id FROM super_admin WHERE national_id = :national_id"),
        params={"national_id": admin_data.national_id}
    ).fetchone()
    if existing_national_id:
        raise HTTPException(status_code=400, detail="National ID already registered")

    existing_phone = db.exec(
        text("SELECT phone FROM super_admin WHERE phone = :phone"),
        params={"phone": admin_data.phone}
    ).fetchone()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    # Insert into database
    hashed_pwd = hash_password(admin_data.password)
    insert_query = text("""
        INSERT INTO super_admin (national_id, name, phone, address, email, password_hash)
        VALUES (:national_id, :name, :phone, :address, :email, :password_hash)
    """)
    db.exec(
        insert_query,
        params={
            "national_id": admin_data.national_id,
            "name": admin_data.name,
            "phone": admin_data.phone,
            "address": admin_data.address,
            "email": admin_data.email,
            "password_hash": hashed_pwd
        }
    )
    db.commit()

    return {"message": "Super Admin successfully created"}

@router.post("/create_officer", status_code=status.HTTP_201_CREATED)
async def create_officer(officer_data: schemas.login.OfficerCreate, db: SessionDep, current_user: Annotated[dict, Depends(get_current_active_user)]):
    # Check if user already exists
    existing_user = db.exec(
        text("SELECT email FROM officer WHERE email = :email"),
        params={"email": officer_data.email}
    ).fetchone()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    existing_national_id = db.exec(
        text("SELECT national_id FROM officer WHERE national_id = :national_id"),
        params={"national_id": officer_data.national_id}
    ).fetchone()
    if existing_national_id:
        raise HTTPException(status_code=400, detail="National ID already registered")

    existing_phone = db.exec(
        text("SELECT phone FROM officer WHERE phone = :phone"),
        params={"phone": officer_data.phone}
    ).fetchone()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    # Check if the prison exists
    existing_prison = db.exec(
        text("SELECT prison_id FROM prison WHERE prison_id = :prison_id"),
        params={"prison_id": officer_data.prison_id}
    ).fetchone()
    if not existing_prison:
        raise HTTPException(status_code=400, detail="Invalid prison ID")

    # Insert into database
    hashed_pwd = hash_password(officer_data.password)
    insert_query = text("""
        INSERT INTO officer (national_id, name, phone, address, email, password_hash, prison_id)
        VALUES (:national_id, :name, :phone, :address, :email, :password_hash, :prison_id)
    """)
    db.exec(
        insert_query,
        params={
            "national_id": officer_data.national_id,
            "name": officer_data.name,
            "phone": officer_data.phone,
            "address": officer_data.address,
            "email": officer_data.email,
            "password_hash": hashed_pwd,
            "prison_id": officer_data.prison_id
        }
    )
    db.commit()

    return {"message": "Officer successfully created"}

@router.get("/users/me")
async def read_users_me(
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    return {"national_id": current_user["national_id"], "role": current_user["role"]}
