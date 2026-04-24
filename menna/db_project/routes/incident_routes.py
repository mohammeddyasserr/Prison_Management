"""
Incident Routes — Incident reporting
PRD Section 6.1: Officers report incidents
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from auth import get_current_user, check_role
from database import get_db
from datetime import datetime

router = APIRouter(prefix="/incidents")
templates = Jinja2Templates(directory="templates")


@router.get("")
async def list_incidents(request: Request):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()
    if user["role"] == "super_admin":
        incidents = db.execute("""
            SELECT inc.*, p.name as prison_name, b.name as block_name,
                   u.name as officer_name
            FROM incidents inc
            LEFT JOIN prisons p ON inc.prison_id = p.prison_id
            LEFT JOIN blocks b ON inc.block_id = b.block_id
            LEFT JOIN users u ON inc.reporting_officer = u.national_id
            ORDER BY inc.date_time DESC
        """).fetchall()
    elif user["role"] == "prison_manager":
        incidents = db.execute("""
            SELECT inc.*, p.name as prison_name, b.name as block_name,
                   u.name as officer_name
            FROM incidents inc
            LEFT JOIN prisons p ON inc.prison_id = p.prison_id
            LEFT JOIN blocks b ON inc.block_id = b.block_id
            LEFT JOIN users u ON inc.reporting_officer = u.national_id
            WHERE inc.prison_id = ?
            ORDER BY inc.date_time DESC
        """, (user["prison_id"],)).fetchall()
    else:
        # Officer: incidents in their assigned blocks
        incidents = db.execute("""
            SELECT DISTINCT inc.*, p.name as prison_name, b.name as block_name,
                   u.name as officer_name
            FROM incidents inc
            LEFT JOIN prisons p ON inc.prison_id = p.prison_id
            LEFT JOIN blocks b ON inc.block_id = b.block_id
            LEFT JOIN users u ON inc.reporting_officer = u.national_id
            JOIN shift_assignments sa ON inc.block_id = sa.block_id
            WHERE sa.officer_id = ?
            ORDER BY inc.date_time DESC
        """, (user["national_id"],)).fetchall()

    db.close()
    return templates.TemplateResponse("incidents/list.html", {
        "request": request, "user": user, "incidents": incidents
    })


@router.get("/api/list")
async def api_list_incidents(request: Request):
    user = get_current_user(request)
    if not user:
        return {"error": "Unauthorized", "incidents": []}

    db = get_db()
    if user["role"] == "super_admin":
        incidents = db.execute("""
            SELECT inc.*, p.name as prison_name, b.name as block_name,
                   u.name as officer_name
            FROM incidents inc
            LEFT JOIN prisons p ON inc.prison_id = p.prison_id
            LEFT JOIN blocks b ON inc.block_id = b.block_id
            LEFT JOIN users u ON inc.reporting_officer = u.national_id
            ORDER BY inc.date_time DESC
        """).fetchall()
    elif user["role"] == "prison_manager":
        incidents = db.execute("""
            SELECT inc.*, p.name as prison_name, b.name as block_name,
                   u.name as officer_name
            FROM incidents inc
            LEFT JOIN prisons p ON inc.prison_id = p.prison_id
            LEFT JOIN blocks b ON inc.block_id = b.block_id
            LEFT JOIN users u ON inc.reporting_officer = u.national_id
            WHERE inc.prison_id = ?
            ORDER BY inc.date_time DESC
        """, (user["prison_id"],)).fetchall()
    else:
        incidents = db.execute("""
            SELECT DISTINCT inc.*, p.name as prison_name, b.name as block_name,
                   u.name as officer_name
            FROM incidents inc
            LEFT JOIN prisons p ON inc.prison_id = p.prison_id
            LEFT JOIN blocks b ON inc.block_id = b.block_id
            LEFT JOIN users u ON inc.reporting_officer = u.national_id
            JOIN shift_assignments sa ON inc.block_id = sa.block_id
            WHERE sa.officer_id = ?
            ORDER BY inc.date_time DESC
        """, (user["national_id"],)).fetchall()
    db.close()
    
    from database import rows_to_dicts
    return {"incidents": rows_to_dicts(incidents)}


@router.get("/api/detail/{incident_id}")
async def api_incident_detail(request: Request, incident_id: int):
    user = get_current_user(request)
    if not user:
        return {"error": "Unauthorized"}

    db = get_db()
    incident = db.execute("""
        SELECT inc.*, p.name as prison_name, b.name as block_name,
               u.name as officer_name
        FROM incidents inc
        LEFT JOIN prisons p ON inc.prison_id = p.prison_id
        LEFT JOIN blocks b ON inc.block_id = b.block_id
        LEFT JOIN users u ON inc.reporting_officer = u.national_id
        WHERE inc.incident_id = ?
    """, (incident_id,)).fetchone()
    
    if not incident:
        db.close()
        return {"error": "Incident not found"}, 404

    involved_inmates = db.execute("""
        SELECT i.* FROM inmates i
        JOIN incident_inmates ii ON i.inmate_id = ii.inmate_id
        WHERE ii.incident_id = ?
    """, (incident_id,)).fetchall()

    involved_staff = db.execute("""
        SELECT u.* FROM users u
        JOIN incident_staff ist ON u.national_id = ist.staff_id
        WHERE ist.incident_id = ?
    """, (incident_id,)).fetchall()

    from database import rows_to_dicts
    db.close()
    return {
        "incident": dict(incident),
        "involved_inmates": rows_to_dicts(involved_inmates),
        "involved_staff": rows_to_dicts(involved_staff)
    }


@router.get("/add")
async def add_incident_form(request: Request):
    """PRD 6.1: Officers report incidents."""
    user = get_current_user(request)
    if not user or not check_role(user, "officer", "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    blocks = db.execute("SELECT * FROM blocks WHERE prison_id = ?", (user["prison_id"],)).fetchall()
    inmates = db.execute("""
        SELECT * FROM inmates WHERE assigned_prison = ? AND status = 'active'
    """, (user["prison_id"],)).fetchall()
    staff = db.execute("""
        SELECT * FROM users WHERE prison_id = ?
    """, (user["prison_id"],)).fetchall()
    db.close()

    return templates.TemplateResponse("incidents/form.html", {
        "request": request, "user": user, "blocks": blocks,
        "inmates": inmates, "staff": staff
    })


@router.get("/api/form-data")
async def api_incident_form_data(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "officer", "prison_manager"):
        return {"error": "Unauthorized", "blocks": [], "inmates": [], "staff": []}

    db = get_db()
    blocks = db.execute("SELECT * FROM blocks WHERE prison_id = ?", (user["prison_id"],)).fetchall()
    inmates = db.execute("""
        SELECT * FROM inmates WHERE assigned_prison = ? AND status = 'active'
    """, (user["prison_id"],)).fetchall()
    staff = db.execute("""
        SELECT * FROM users WHERE prison_id = ?
    """, (user["prison_id"],)).fetchall()
    from database import rows_to_dicts
    db.close()
    return {
        "blocks": rows_to_dicts(blocks),
        "inmates": rows_to_dicts(inmates),
        "staff": rows_to_dicts(staff)
    }


@router.post("/add")
async def add_incident(request: Request):
    """PRD 6.1: Create incident report with all specified fields."""
    user = get_current_user(request)
    if not user or not check_role(user, "officer", "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    form = await request.form()
    db = get_db()

    cursor = db.execute("""
        INSERT INTO incidents (type, date_time, prison_id, block_id, cell_id,
                              reporting_officer, description, action_taken)
        VALUES (?,?,?,?,?,?,?,?)
    """, (
        form.get("type"), form.get("date_time") or datetime.now().strftime("%Y-%m-%d %H:%M"),
        user["prison_id"], form.get("block_id") or None, form.get("cell_id") or None,
        user["national_id"], form.get("description"), form.get("action_taken")
    ))
    incident_id = cursor.lastrowid

    # Add involved inmates (PRD 6.1: Inmates Involved)
    inmate_ids = form.getlist("inmate_ids")
    for iid in inmate_ids:
        if iid:
            db.execute("INSERT OR IGNORE INTO incident_inmates (incident_id, inmate_id) VALUES (?,?)",
                      (incident_id, int(iid)))

    # Add involved staff (PRD 6.1: Staff Involved)
    staff_ids = form.getlist("staff_ids")
    for sid in staff_ids:
        if sid:
            db.execute("INSERT OR IGNORE INTO incident_staff (incident_id, staff_id) VALUES (?,?)",
                      (incident_id, sid))

    # Add witnesses (PRD 6.1: Witnesses)
    witness_ids = form.getlist("witness_ids")
    for wid in witness_ids:
        if wid:
            db.execute("INSERT OR IGNORE INTO incident_witnesses (incident_id, witness_id) VALUES (?,?)",
                      (incident_id, wid))

    db.commit()
    db.close()
    return RedirectResponse(url="/incidents", status_code=302)


@router.get("/{incident_id}")
async def incident_detail(request: Request, incident_id: int):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()
    incident = db.execute("""
        SELECT inc.*, p.name as prison_name, b.name as block_name,
               u.name as officer_name
        FROM incidents inc
        LEFT JOIN prisons p ON inc.prison_id = p.prison_id
        LEFT JOIN blocks b ON inc.block_id = b.block_id
        LEFT JOIN users u ON inc.reporting_officer = u.national_id
        WHERE inc.incident_id = ?
    """, (incident_id,)).fetchone()

    involved_inmates = db.execute("""
        SELECT i.* FROM inmates i
        JOIN incident_inmates ii ON i.inmate_id = ii.inmate_id
        WHERE ii.incident_id = ?
    """, (incident_id,)).fetchall()

    involved_staff = db.execute("""
        SELECT u.* FROM users u
        JOIN incident_staff ist ON u.national_id = ist.staff_id
        WHERE ist.incident_id = ?
    """, (incident_id,)).fetchall()

    witnesses = db.execute("""
        SELECT * FROM incident_witnesses WHERE incident_id = ?
    """, (incident_id,)).fetchall()

    db.close()
    return templates.TemplateResponse("incidents/detail.html", {
        "request": request, "user": user, "incident": incident,
        "involved_inmates": involved_inmates, "involved_staff": involved_staff,
        "witnesses": witnesses
    })
