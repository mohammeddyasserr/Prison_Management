from fastapi import FastAPI
from database import create_db_and_tables
from routers import prison, routers
import models

app = FastAPI()

# Add all routers
for router in routers:
    app.include_router(router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(prison.router)


