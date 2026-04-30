from fastapi import FastAPI
from database import create_db_and_tables
from routers import prison
from routers import block
from routers import cell
from routers import staff
import models

app = FastAPI()



@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(prison.router)
app.include_router(block.router)
app.include_router(cell.router)
app.include_router(staff.router)
