from fastapi import FastAPI
from database import create_db_and_tables
from routers import prison
from routers import incidents
from routers import disciplinary
from routers import transfer

app = FastAPI()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(prison.router)
app.include_router(transfer.router)
app.include_router(incidents.router)
app.include_router(disciplinary.router)