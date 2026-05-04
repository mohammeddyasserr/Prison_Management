from fastapi import FastAPI
from database import create_db_and_tables
from routers import prison
from routers import block
from routers import cell
from routers import staff
from routers import incidents
from routers import disciplinary
from routers import visit
from routers import transfer
from routers import inmate
from routers import legal_case
from routers import shift
from routers import doctor
from routers import medical_visit
from routers import authentication
import models

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
app.include_router(visit.router)
app.include_router(transfer.router)
app.include_router(incidents.router)
app.include_router(disciplinary.router)
app.include_router(authentication.router)
