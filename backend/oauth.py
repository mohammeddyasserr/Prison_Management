from typing import Annotated
from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import text
from pwdlib import PasswordHash
from database import SessionDep

# Create a password hasher with recommended settings
password_hash_ctx = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login/token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash_ctx.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    return password_hash_ctx.hash(password)

def get_user(db: SessionDep, username: str):
    # Check super admin first
    query = text("""
        SELECT national_id, password_hash, name 
        FROM super_admin 
        WHERE email = :username 
           OR national_id = :username 
           OR phone = :username
    """)
    user = db.exec(query, params={"username": username}).fetchone()
    if user:
        return {"national_id": user[0], "password_hash": user[1], "name": user[2], "role": "admin"}
    
    # Check officer next
    query_officer = text("""
        SELECT national_id, password_hash, name 
        FROM officer 
        WHERE email = :username 
           OR national_id = :username 
           OR phone = :username
    """)
    officer = db.exec(query_officer, params={"username": username}).fetchone()
    
    if officer:
        # Check if they are a manager
        manager_query = text("""
            SELECT prison_id 
            FROM prison 
            WHERE manager_id = :national_id
        """)
        manager = db.exec(manager_query, params={"national_id": officer[0]}).fetchone()
        
        role = "manager" if manager else "officer"
        return {"national_id": officer[0], "password_hash": officer[1], "name": officer[2], "role": role}

    return None

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: SessionDep):
    # A real verification of a JWT token goes here. 
    # For now, token stands for email/username/id.
    user = get_user(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"national_id": user["national_id"], "role": user["role"]}


async def get_current_active_user(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    return current_user
