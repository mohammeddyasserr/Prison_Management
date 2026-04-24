"""
Shift Routes — Shift assignment management
PRD Section 3.5: Shift Management
PRD 3.5.1: Rules — one officer per block per shift, officer sees own schedule
PRD 3.5.2: Data Model
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from auth import get_current_user, check_role
from database import get_db

router = APIRouter(prefix="/shifts")
templates = Jinja2Templates(directory="templates")

# PRD 3.5: Shift time mappings
SHIFT_TIMES = {
    "Morning":   ("06:00", "14:00"),
    "Afternoon": ("14:00", "22:00"),
    "Night":     ("22:00", "06:00"),
}


@router.get("")
async def list_shifts(request: Request):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()

    if user["role"] == "officer":
        # PRD 3.5.1: Officers view their own schedule
        shifts = db.execute("""
            SELECT sa.*, b.name as block_name, p.name as prison_name
            FROM shift_assignments sa
            JOIN blocks b ON sa.block_id = b.block_id
            JOIN prisons p ON b.prison_id = p.prison_id
            WHERE sa.officer_id = ?
            ORDER BY sa.date DESC, sa.start_time
        """, (user["national_id"],)).fetchall()
    elif user["role"] == "prison_manager":
        shifts = db.execute("""
            SELECT sa.*, b.name as block_name, u.name as officer_name
            FROM shift_assignments sa
            JOIN blocks b ON sa.block_id = b.block_id
            JOIN users u ON sa.officer_id = u.national_id
            WHERE b.prison_id = ?
            ORDER BY sa.date DESC, sa.start_time
        """, (user["prison_id"],)).fetchall()
    else:
        shifts = db.execute("""
            SELECT sa.*, b.name as block_name, u.name as officer_name, p.name as prison_name
            FROM shift_assignments sa
            JOIN blocks b ON sa.block_id = b.block_id
            JOIN users u ON sa.officer_id = u.national_id
            JOIN prisons p ON b.prison_id = p.prison_id
            ORDER BY sa.date DESC, sa.start_time
        """).fetchall()

    # Get officers and blocks for the form (manager only)
    officers = []
    blocks = []
    if check_role(user, "prison_manager"):
        officers = db.execute("""
            SELECT * FROM users WHERE prison_id = ? AND role = 'officer'
        """, (user["prison_id"],)).fetchall()
        blocks = db.execute("""
            SELECT * FROM blocks WHERE prison_id = ?
        """, (user["prison_id"],)).fetchall()

    db.close()
    return templates.TemplateResponse("shifts/list.html", {
        "request": request, "user": user, "shifts": shifts,
        "officers": officers, "blocks": blocks, "shift_times": SHIFT_TIMES
    })


@router.get("/api/list")
async def api_list_shifts(request: Request):
    user = get_current_user(request)
    if not user:
        return {"error": "Unauthorized", "shifts": [], "officers": [], "blocks": [], "shift_times": SHIFT_TIMES}

    db = get_db()
    if user["role"] == "officer":
        shifts = db.execute("""
            SELECT sa.*, b.name as block_name, p.name as prison_name
            FROM shift_assignments sa
            JOIN blocks b ON sa.block_id = b.block_id
            JOIN prisons p ON b.prison_id = p.prison_id
            WHERE sa.officer_id = ?
            ORDER BY sa.date DESC, sa.start_time
        """, (user["national_id"],)).fetchall()
    elif user["role"] == "prison_manager":
        shifts = db.execute("""
            SELECT sa.*, b.name as block_name, u.name as officer_name
            FROM shift_assignments sa
            JOIN blocks b ON sa.block_id = b.block_id
            JOIN users u ON sa.officer_id = u.national_id
            WHERE b.prison_id = ?
            ORDER BY sa.date DESC, sa.start_time
        """, (user["prison_id"],)).fetchall()
    else:
        shifts = db.execute("""
            SELECT sa.*, b.name as block_name, u.name as officer_name, p.name as prison_name
            FROM shift_assignments sa
            JOIN blocks b ON sa.block_id = b.block_id
            JOIN users u ON sa.officer_id = u.national_id
            JOIN prisons p ON b.prison_id = p.prison_id
            ORDER BY sa.date DESC, sa.start_time
        """).fetchall()

    officers = []
    blocks = []
    if check_role(user, "prison_manager"):
        officers = db.execute("""
            SELECT * FROM users WHERE prison_id = ? AND role = 'officer'
        """, (user["prison_id"],)).fetchall()
        blocks = db.execute("""
            SELECT * FROM blocks WHERE prison_id = ?
        """, (user["prison_id"],)).fetchall()
    db.close()

    from database import rows_to_dicts
    return {
        "shifts": rows_to_dicts(shifts),
        "officers": rows_to_dicts(officers),
        "blocks": rows_to_dicts(blocks),
        "shift_times": SHIFT_TIMES
    }


@router.post("/add")
async def add_shift(
    request: Request,
    officer_id: str = Form(...), block_id: int = Form(...),
    shift_type: str = Form(...), date: str = Form(...)
):
    """
    PRD 3.5.1 Rules:
    - Each block must have at least one officer per shift
    - An officer can only be assigned to one block per shift slot
    """
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    # Auto-fill start/end time from shift type (PRD 3.5.2)
    start_time, end_time = SHIFT_TIMES.get(shift_type, ("00:00", "00:00"))

    db = get_db()

    # PRD 3.5.1: Check if officer is already assigned to another block for this shift/date
    existing = db.execute("""
        SELECT * FROM shift_assignments
        WHERE officer_id = ? AND date = ? AND shift_type = ?
    """, (officer_id, date, shift_type)).fetchone()

    if existing:
        db.close()
        return RedirectResponse(url="/shifts?error=officer_busy", status_code=302)

    db.execute("""
        INSERT INTO shift_assignments (officer_id, block_id, shift_type, date, start_time, end_time)
        VALUES (?,?,?,?,?,?)
    """, (officer_id, block_id, shift_type, date, start_time, end_time))
    db.commit()
    db.close()
    return RedirectResponse(url="/shifts", status_code=302)


@router.post("/{shift_id}/delete")
async def delete_shift(request: Request, shift_id: int):
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    db.execute("DELETE FROM shift_assignments WHERE shift_id = ?", (shift_id,))
    db.commit()
    db.close()
    return RedirectResponse(url="/shifts", status_code=302)
