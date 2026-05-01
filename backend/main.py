from fastapi import FastAPI
from database import create_db_and_tables
from routers import prison 
from routers import inmate
from routers import legal_case
from routers import shift

app = FastAPI()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(prison.router)
app.include_router(inmate.router)
app.include_router(legal_case.router)
app.include_router(shift.router)
