"""
Healthcare Routes — Doctors and Medical Visits
PRD Section 7.1 (Doctors), 7.2 (Medical Visit Reports)
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from auth import get_current_user, check_role
from database import get_db

router = APIRouter(prefix="/healthcare")
templates = Jinja2Templates(directory="templates")


@router.get("")
async def healthcare_overview(request: Request):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()
    if user["role"] == "super_admin":
        doctors = db.execute("""
            SELECT d.*, p.name as prison_name FROM doctors d
            JOIN prisons p ON d.prison_id = p.prison_id
        """).fetchall()
        visits = db.execute("""
            SELECT mv.*, i.full_name as inmate_name, d.name as doctor_name, p.name as prison_name
            FROM medical_visits mv
            JOIN inmates i ON mv.inmate_id = i.inmate_id
            JOIN doctors d ON mv.doctor_id = d.national_id
            JOIN prisons p ON d.prison_id = p.prison_id
            ORDER BY mv.date_time DESC LIMIT 50
        """).fetchall()
    else:
        doctors = db.execute("""
            SELECT d.*, p.name as prison_name FROM doctors d
            JOIN prisons p ON d.prison_id = p.prison_id
            WHERE d.prison_id = ?
        """, (user["prison_id"],)).fetchall()
        visits = db.execute("""
            SELECT mv.*, i.full_name as inmate_name, d.name as doctor_name
            FROM medical_visits mv
            JOIN inmates i ON mv.inmate_id = i.inmate_id
            JOIN doctors d ON mv.doctor_id = d.national_id
            WHERE d.prison_id = ?
            ORDER BY mv.date_time DESC LIMIT 50
        """, (user["prison_id"],)).fetchall()

    db.close()
    return templates.TemplateResponse("healthcare/overview.html", {
        "request": request, "user": user, "doctors": doctors, "visits": visits
    })


@router.get("/api/form-data")
async def api_healthcare_form_data(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin", "prison_manager"):
        return {"error": "Unauthorized", "inmates": [], "doctors": [], "prisons": []}

    db = get_db()
    if user["role"] == "super_admin":
        inmates = db.execute("SELECT * FROM inmates WHERE status = 'active'").fetchall()
        doctors = db.execute("SELECT * FROM doctors").fetchall()
    else:
        inmates = db.execute("""
            SELECT * FROM inmates WHERE assigned_prison = ? AND status = 'active'
        """, (user["prison_id"],)).fetchall()
        doctors = db.execute("""
            SELECT * FROM doctors WHERE prison_id = ?
        """, (user["prison_id"],)).fetchall()
    prisons = db.execute("SELECT * FROM prisons").fetchall()
    from database import rows_to_dicts
    db.close()
    return {
        "inmates": rows_to_dicts(inmates),
        "doctors": rows_to_dicts(doctors),
        "prisons": rows_to_dicts(prisons)
    }


@router.get("/api/overview")
async def api_healthcare_overview(request: Request):
    user = get_current_user(request)
    if not user:
        return {"error": "Unauthorized", "doctors": [], "visits": []}

    db = get_db()
    if user["role"] == "super_admin":
        doctors = db.execute("""
            SELECT d.*, p.name as prison_name FROM doctors d
            JOIN prisons p ON d.prison_id = p.prison_id
        """).fetchall()
        visits = db.execute("""
            SELECT mv.*, i.full_name as inmate_name, d.name as doctor_name, p.name as prison_name
            FROM medical_visits mv
            JOIN inmates i ON mv.inmate_id = i.inmate_id
            JOIN doctors d ON mv.doctor_id = d.national_id
            JOIN prisons p ON d.prison_id = p.prison_id
            ORDER BY mv.date_time DESC LIMIT 50
        """).fetchall()
    else:
        doctors = db.execute("""
            SELECT d.*, p.name as prison_name FROM doctors d
            JOIN prisons p ON d.prison_id = p.prison_id
            WHERE d.prison_id = ?
        """, (user["prison_id"],)).fetchall()
        visits = db.execute("""
            SELECT mv.*, i.full_name as inmate_name, d.name as doctor_name
            FROM medical_visits mv
            JOIN inmates i ON mv.inmate_id = i.inmate_id
            JOIN doctors d ON mv.doctor_id = d.national_id
            WHERE d.prison_id = ?
            ORDER BY mv.date_time DESC LIMIT 50
        """, (user["prison_id"],)).fetchall()
    db.close()
    
    from database import rows_to_dicts
    return {
        "doctors": rows_to_dicts(doctors),
        "visits": rows_to_dicts(visits)
    }


@router.get("/doctors/add")
async def add_doctor_form(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin", "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    prisons = db.execute("SELECT * FROM prisons").fetchall()
    db.close()
    return templates.TemplateResponse("healthcare/doctor_form.html", {
        "request": request, "user": user, "prisons": prisons
    })


@router.post("/doctors/add")
async def add_doctor(
    request: Request,
    national_id: str = Form(...), name: str = Form(...),
    address: str = Form(""), phone: str = Form(""),
    prison_id: int = Form(...)
):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin", "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    db.execute("""
        INSERT INTO doctors (national_id, name, address, phone, prison_id)
        VALUES (?,?,?,?,?)
    """, (national_id, name, address, phone, prison_id))
    db.commit()
    db.close()
    return RedirectResponse(url="/healthcare", status_code=302)


@router.get("/visits/add")
async def add_medical_visit_form(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin", "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    pid = user["prison_id"] if user["role"] == "prison_manager" else None
    if pid:
        inmates = db.execute("SELECT * FROM inmates WHERE assigned_prison = ? AND status = 'active'", (pid,)).fetchall()
        doctors = db.execute("SELECT * FROM doctors WHERE prison_id = ?", (pid,)).fetchall()
    else:
        inmates = db.execute("SELECT * FROM inmates WHERE status = 'active'").fetchall()
        doctors = db.execute("SELECT * FROM doctors").fetchall()
    db.close()

    return templates.TemplateResponse("healthcare/visit_form.html", {
        "request": request, "user": user, "inmates": inmates, "doctors": doctors
    })


@router.post("/visits/add")
async def add_medical_visit(
    request: Request,
    inmate_id: int = Form(...), doctor_id: str = Form(...),
    date_time: str = Form(...), diagnosis: str = Form(""),
    description: str = Form("")
):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin", "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    db.execute("""
        INSERT INTO medical_visits (inmate_id, doctor_id, date_time, diagnosis, description)
        VALUES (?,?,?,?,?)
    """, (inmate_id, doctor_id, date_time, diagnosis, description))
    db.commit()
    db.close()
    return RedirectResponse(url="/healthcare", status_code=302)
