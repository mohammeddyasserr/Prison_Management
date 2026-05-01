"""
main.py — CPMS Application Entry Point
Centralized Prison Management System

Run with: uvicorn main:app --reload
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
import os

from database import init_db, get_db

# Initialize the database tables on startup
init_db()

# Auto-seed the database if no users exist
def auto_seed_if_empty():
    """Check if the database is empty and seed it with demo data."""
    try:
        db = get_db()
        user_count = db.execute("SELECT COUNT(*) as count FROM users").fetchone()["count"]
        db.close()
        if user_count == 0:
            print("No users found in database. Seeding with demo data...")
            from seed import seed_data
            seed_data()
            print("Demo data seeded successfully!")
    except Exception as e:
        print(f"Warning: Could not auto-seed database: {e}")

# Run auto-seed on startup
auto_seed_if_empty()

app = FastAPI(title="CPMS — Centralized Prison Management System")

# Session middleware for login sessions [NOT IN PRD — needed for auth]
app.add_middleware(SessionMiddleware, secret_key="cpms-secret-key-change-in-production")

# Static files (CSS, JS)
os.makedirs(os.path.join(os.path.dirname(__file__), "static", "css"), exist_ok=True)
os.makedirs(os.path.join(os.path.dirname(__file__), "static", "js"), exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


# ── Import and register all route modules ──
from routes.auth_routes import router as auth_router
from routes.dashboard_routes import router as dashboard_router
from routes.prison_routes import router as prison_router
from routes.inmate_routes import router as inmate_router
from routes.transfer_routes import router as transfer_router
from routes.visit_routes import router as visit_router
from routes.public_visit_routes import router as public_visit_router
from routes.incident_routes import router as incident_router
from routes.disciplinary_routes import router as disciplinary_router
from routes.healthcare_routes import router as healthcare_router
from routes.shift_routes import router as shift_router
from routes.officer_routes import router as officer_router
from routes.ml_routes import router as ml_router

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(prison_router)
app.include_router(inmate_router)
app.include_router(transfer_router)
app.include_router(visit_router)
app.include_router(public_visit_router)
app.include_router(incident_router)
app.include_router(disciplinary_router)
app.include_router(healthcare_router)
app.include_router(shift_router)
app.include_router(officer_router)
app.include_router(ml_router)
