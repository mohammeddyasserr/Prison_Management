"""
Disciplinary Routes — Disciplinary log management
PRD Section 6.2: Mandatory registry, cannot be deleted.
Solitary confinement max 30 days (PRD 10.5).
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from auth import get_current_user, check_role
from database import get_db

router = APIRouter(prefix="/disciplinary")
templates = Jinja2Templates(directory="templates")


@router.get("")
async def list_disciplinary(request: Request):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()
    if user["role"] == "super_admin":
        logs = db.execute("""
            SELECT dl.*, i.full_name as inmate_name, u.name as imposed_by_name
            FROM disciplinary_logs dl
            JOIN inmates i ON dl.inmate_id = i.inmate_id
            LEFT JOIN users u ON dl.imposed_by = u.national_id
            ORDER BY dl.date_imposed DESC
        """).fetchall()
    else:
        logs = db.execute("""
            SELECT dl.*, i.full_name as inmate_name, u.name as imposed_by_name
            FROM disciplinary_logs dl
            JOIN inmates i ON dl.inmate_id = i.inmate_id
            LEFT JOIN users u ON dl.imposed_by = u.national_id
            WHERE i.assigned_prison = ?
            ORDER BY dl.date_imposed DESC
        """, (user["prison_id"],)).fetchall()

    db.close()
    return templates.TemplateResponse("disciplinary/list.html", {
        "request": request, "user": user, "logs": logs
    })


@router.get("/add")
async def add_disciplinary_form(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "officer", "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    inmates = db.execute("""
        SELECT * FROM inmates WHERE assigned_prison = ? AND status = 'active'
    """, (user["prison_id"],)).fetchall()
    incidents = db.execute("""
        SELECT * FROM incidents WHERE prison_id = ? ORDER BY date_time DESC
    """, (user["prison_id"],)).fetchall()
    db.close()

    return templates.TemplateResponse("disciplinary/form.html", {
        "request": request, "user": user, "inmates": inmates, "incidents": incidents
    })


@router.post("/add")
async def add_disciplinary(
    request: Request,
    inmate_id: int = Form(...),
    incident_id: int = Form(0),
    punishment_type: str = Form(...),
    solitary_confinement_duration: int = Form(0),
    date_imposed: str = Form(...),
    end_date: str = Form(""),
    notes: str = Form("")
):
    """PRD 6.2: Record disciplinary action. Solitary max 30 days enforced."""
    user = get_current_user(request)
    if not user or not check_role(user, "officer", "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    # PRD 10.5: Enforce 30-day maximum for solitary confinement
    if solitary_confinement_duration > 30:
        solitary_confinement_duration = 30

    db = get_db()
    db.execute("""
        INSERT INTO disciplinary_logs
        (inmate_id, incident_id, punishment_type, solitary_confinement_duration,
         imposed_by, date_imposed, end_date, notes)
        VALUES (?,?,?,?,?,?,?,?)
    """, (
        inmate_id, incident_id if incident_id else None,
        punishment_type, solitary_confinement_duration if solitary_confinement_duration else None,
        user["national_id"], date_imposed, end_date or None, notes
    ))
    db.commit()
    db.close()
    return RedirectResponse(url="/disciplinary", status_code=302)

# NOTE: No delete route — PRD 6.2 states disciplinary logs "cannot be deleted"
