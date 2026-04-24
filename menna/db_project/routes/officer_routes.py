"""
Officer Routes — Officer management
PRD Section 2.2.4: Officer Data Model
PRD 3.1: Super Admin manages user accounts
PRD 3.2: Prison Manager views officers
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from auth import get_current_user, check_role, hash_password
from database import get_db

router = APIRouter(prefix="/officers")
templates = Jinja2Templates(directory="templates")


@router.get("")
async def list_officers(request: Request):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()
    if user["role"] == "super_admin":
        officers = db.execute("""
            SELECT u.*, p.name as prison_name
            FROM users u LEFT JOIN prisons p ON u.prison_id = p.prison_id
            WHERE u.role IN ('officer', 'prison_manager')
            ORDER BY u.role, u.name
        """).fetchall()
    else:
        officers = db.execute("""
            SELECT u.*, p.name as prison_name
            FROM users u LEFT JOIN prisons p ON u.prison_id = p.prison_id
            WHERE u.prison_id = ? AND u.role IN ('officer', 'prison_manager')
            ORDER BY u.role, u.name
        """, (user["prison_id"],)).fetchall()

    prisons = []
    if check_role(user, "super_admin"):
        prisons = db.execute("SELECT * FROM prisons").fetchall()

    db.close()
    return templates.TemplateResponse("officers/list.html", {
        "request": request, "user": user, "officers": officers, "prisons": prisons
    })


@router.get("/api/list")
async def api_list_officers(request: Request):
    user = get_current_user(request)
    if not user:
        return {"error": "Unauthorized", "officers": []}

    db = get_db()
    if user["role"] == "super_admin":
        officers = db.execute("""
            SELECT u.*, p.name as prison_name
            FROM users u LEFT JOIN prisons p ON u.prison_id = p.prison_id
            WHERE u.role IN ('officer', 'prison_manager')
            ORDER BY u.role, u.name
        """).fetchall()
    else:
        officers = db.execute("""
            SELECT u.*, p.name as prison_name
            FROM users u LEFT JOIN prisons p ON u.prison_id = p.prison_id
            WHERE u.prison_id = ? AND u.role IN ('officer', 'prison_manager')
            ORDER BY u.role, u.name
        """, (user["prison_id"],)).fetchall()
    db.close()
    
    from database import rows_to_dicts
    return {"officers": rows_to_dicts(officers)}


@router.get("/add")
async def add_officer_form(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    prisons = db.execute("SELECT * FROM prisons").fetchall()
    db.close()
    return templates.TemplateResponse("officers/form.html", {
        "request": request, "user": user, "prisons": prisons, "officer": None
    })


@router.get("/api/form-data")
async def api_officer_form_data(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin"):
        return {"error": "Unauthorized", "prisons": []}

    db = get_db()
    prisons = db.execute("SELECT * FROM prisons").fetchall()
    from database import rows_to_dicts
    db.close()
    return {"prisons": rows_to_dicts(prisons)}


@router.post("/add")
async def add_officer(
    request: Request,
    national_id: str = Form(...), name: str = Form(...),
    phone: str = Form(""), address: str = Form(""),
    email: str = Form(""), password: str = Form(...),
    role: str = Form("officer"), prison_id: int = Form(0)
):
    """PRD 3.1: Super Admin manages user accounts and role assignments."""
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    db.execute("""
        INSERT INTO users (national_id, name, phone, address, email, password, role, prison_id)
        VALUES (?,?,?,?,?,?,?,?)
    """, (national_id, name, phone, address, email, hash_password(password),
          role, prison_id if prison_id else None))
    db.commit()
    db.close()
    return RedirectResponse(url="/officers", status_code=302)
