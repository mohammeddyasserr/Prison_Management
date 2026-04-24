"""
Visit Routes (Admin side) — Visit management, time slots
PRD Section 5: Visit Management
PRD 3.2: Manager adds time slots, approves/denies visit requests
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from auth import get_current_user, check_role
from database import get_db

router = APIRouter(prefix="/visits")
templates = Jinja2Templates(directory="templates")


@router.get("")
async def list_visits(request: Request):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()
    if user["role"] == "super_admin":
        visits = db.execute("""
            SELECT v.*, vis.full_name as visitor_name, vis.relationship,
                   i.full_name as inmate_name, p.name as prison_name
            FROM visits v
            LEFT JOIN visitors vis ON v.visit_id = vis.visit_id
            LEFT JOIN inmates i ON v.inmate_national_id = i.national_id
            LEFT JOIN prisons p ON v.prison_id = p.prison_id
            ORDER BY v.visit_date DESC
        """).fetchall()
    else:
        visits = db.execute("""
            SELECT v.*, vis.full_name as visitor_name, vis.relationship,
                   i.full_name as inmate_name, p.name as prison_name
            FROM visits v
            LEFT JOIN visitors vis ON v.visit_id = vis.visit_id
            LEFT JOIN inmates i ON v.inmate_national_id = i.national_id
            LEFT JOIN prisons p ON v.prison_id = p.prison_id
            WHERE v.prison_id = ?
            ORDER BY v.visit_date DESC
        """, (user["prison_id"],)).fetchall()

    db.close()
    return templates.TemplateResponse("visits/list.html", {
        "request": request, "user": user, "visits": visits
    })


@router.get("/api/list")
async def api_list_visits(request: Request):
    user = get_current_user(request)
    if not user:
        return {"error": "Unauthorized", "visits": []}

    db = get_db()
    if user["role"] == "super_admin":
        visits = db.execute("""
            SELECT v.*, vis.full_name as visitor_name, vis.relationship,
                   i.full_name as inmate_name, p.name as prison_name
            FROM visits v
            LEFT JOIN visitors vis ON v.visit_id = vis.visit_id
            LEFT JOIN inmates i ON v.inmate_national_id = i.national_id
            LEFT JOIN prisons p ON v.prison_id = p.prison_id
            ORDER BY v.visit_date DESC
        """).fetchall()
    else:
        visits = db.execute("""
            SELECT v.*, vis.full_name as visitor_name, vis.relationship,
                   i.full_name as inmate_name, p.name as prison_name
            FROM visits v
            LEFT JOIN visitors vis ON v.visit_id = vis.visit_id
            LEFT JOIN inmates i ON v.inmate_national_id = i.national_id
            LEFT JOIN prisons p ON v.prison_id = p.prison_id
            WHERE v.prison_id = ?
            ORDER BY v.visit_date DESC
        """, (user["prison_id"],)).fetchall()
    db.close()
    
    from database import rows_to_dicts
    return {"visits": rows_to_dicts(visits)}


@router.post("/{visit_id}/approve")
async def approve_visit(request: Request, visit_id: int):
    """PRD 3.2: Prison Manager approves visit."""
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    db.execute("UPDATE visits SET status = 'Approved' WHERE visit_id = ?", (visit_id,))
    db.commit()
    db.close()
    return RedirectResponse(url="/visits", status_code=302)


@router.post("/{visit_id}/deny")
async def deny_visit(request: Request, visit_id: int, denial_reason: str = Form("")):
    """PRD 5.2: Denied visits include a reason."""
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    db.execute("""
        UPDATE visits SET status = 'Denied', denial_reason = ? WHERE visit_id = ?
    """, (denial_reason, visit_id))
    db.commit()
    db.close()
    return RedirectResponse(url="/visits", status_code=302)


# ── Time Slots (PRD 3.2: Manager adds time slots) ──

@router.get("/slots")
async def manage_slots(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    slots = db.execute("""
        SELECT * FROM visit_time_slots WHERE prison_id = ?
    """, (user["prison_id"],)).fetchall()
    db.close()

    return templates.TemplateResponse("visits/slots.html", {
        "request": request, "user": user, "slots": slots
    })


@router.get("/api/slots")
async def api_visit_slots(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return {"error": "Unauthorized", "slots": []}

    db = get_db()
    slots = db.execute("""
        SELECT * FROM visit_time_slots WHERE prison_id = ?
    """, (user["prison_id"],)).fetchall()
    from database import rows_to_dicts
    db.close()
    return {"slots": rows_to_dicts(slots)}


@router.post("/slots/add")
async def add_slot(
    request: Request,
    slot_label: str = Form(...), start_time: str = Form(...),
    end_time: str = Form(...), max_visitors: int = Form(1)
):
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    db.execute("""
        INSERT INTO visit_time_slots (prison_id, slot_label, start_time, end_time, max_visitors)
        VALUES (?,?,?,?,?)
    """, (user["prison_id"], slot_label, start_time, end_time, max_visitors))
    db.commit()
    db.close()
    return RedirectResponse(url="/visits/slots", status_code=302)


@router.post("/slots/{slot_id}/delete")
async def delete_slot(request: Request, slot_id: int):
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    db.execute("DELETE FROM visit_time_slots WHERE slot_id = ? AND prison_id = ?",
               (slot_id, user["prison_id"]))
    db.commit()
    db.close()
    return RedirectResponse(url="/visits/slots", status_code=302)
