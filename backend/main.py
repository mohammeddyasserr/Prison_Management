from fastapi import FastAPI
from database import create_db_and_tables
from routers import prison
from routers import block
from routers import cell
from routers import staff
import models
from routers import inmate
from routers import legal_case
from routers import shift
from routers import doctor
from routers import medical_visit


app = FastAPI()



@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(prison.router)
app.include_router(block.router)
app.include_router(cell.router)
app.include_router(staff.router)
app.include_router(inmate.router)
app.include_router(legal_case.router)
app.include_router(shift.router)
app.include_router(doctor.router)
app.include_router(medical_visit.router)
