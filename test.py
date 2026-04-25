# this file will be deleted after the test is done, so you can put any code here that you want to test. You can also create new files and put code in them, and they will also be deleted after the test is done.
import mysql.connector
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
# Loaded from .env file
db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "prison_db")
}

# Pydantic model for Prison
class PrisonCreate(BaseModel):
    name: str
    location: str
    type: str
    security_level: str
    total_capacity: int
    current_occupancy: int = 0
    has_infirmary: bool = False
    has_workshops: bool = False
    has_agricultural_ward: bool = False
    has_visitation_hall: bool = False
    visitation_hall_capacity: Optional[int] = None
    manager_id: Optional[str] = None

class PrisonResponse(PrisonCreate):
    prison_id: int

def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {err}")

@app.post("/prison", response_model=PrisonResponse)
async def create_prison(prison: PrisonCreate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    INSERT INTO prison (
        name, location, type, security_level, total_capacity, current_occupancy,
        has_infirmary, has_workshops, has_agricultural_ward, has_visitation_hall,
        visitation_hall_capacity, manager_id
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        prison.name, prison.location, prison.type, prison.security_level,
        prison.total_capacity, prison.current_occupancy, prison.has_infirmary,
        prison.has_workshops, prison.has_agricultural_ward, prison.has_visitation_hall,
        prison.visitation_hall_capacity, prison.manager_id
    )
    
    try:
        cursor.execute(query, values)
        conn.commit()
        prison_id = cursor.lastrowid
        
        # Return the created prison
        cursor.execute("SELECT * FROM prison WHERE prison_id = %s", (prison_id,))
        new_prison = cursor.fetchone()
        return new_prison
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@app.get("/prison/{prison_id}", response_model=PrisonResponse)
async def get_prison(prison_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM prison WHERE prison_id = %s", (prison_id,))
        prison = cursor.fetchone()
        
        if prison is None:
            raise HTTPException(status_code=404, detail="Prison not found")
        
        return prison
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)