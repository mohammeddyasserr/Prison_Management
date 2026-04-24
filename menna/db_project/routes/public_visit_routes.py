"""
Public Visit Request Portal
PRD Section 3.4 & 5.1: Anyone can submit a visit request without an account.
"""
from fastapi import APIRouter, Request, Form
from compat import Jinja2Templates
from database import get_db, rows_to_dicts

router = APIRouter(prefix="/visit-request")
templates = Jinja2Templates(directory="templates")


def get_visit_request_context(inmate_national_id: str):
    db = get_db()
    inmate = db.execute("""
        SELECT i.*, p.name as prison_name
        FROM inmates i
        LEFT JOIN prisons p ON i.assigned_prison = p.prison_id
        WHERE lower(trim(i.national_id)) = lower(?) AND i.status = 'active'
    """, ((inmate_national_id or "").strip(),)).fetchone()

    if not inmate:
        db.close()
        return None, [], "No active inmate found with this National ID."

    slots = db.execute("""
        SELECT slot_id, slot_label, start_time, end_time, max_visitors
        FROM visit_time_slots
        WHERE prison_id = ?
        ORDER BY start_time
    """, (inmate["assigned_prison"],)).fetchall()
    db.close()

    return dict(inmate), rows_to_dicts(slots), None


def create_visit_request(
    inmate_national_id: str,
    visitor_name: str,
    visitor_national_id: str,
    relationship: str,
    phone: str,
    email: str,
    visit_date: str,
    time_slot: str,
    visit_type: str,
):
    db = get_db()

    inmate = db.execute("""
        SELECT * FROM inmates
        WHERE lower(trim(national_id)) = lower(?) AND status = 'active'
    """, ((inmate_national_id or "").strip(),)).fetchone()

    if not inmate:
        db.close()
        return None, "No active inmate found with this National ID."

    cursor = db.execute("""
        INSERT INTO visits (inmate_national_id, visit_date, time_slot, duration, status, visit_type, prison_id)
        VALUES (?, ?, ?, 30, 'Pending', ?, ?)
    """, (
        inmate_national_id.strip(),
        visit_date,
        time_slot.strip(),
        visit_type,
        inmate["assigned_prison"],
    ))

    visit_id = cursor.lastrowid

    db.execute("""
        INSERT INTO visitors (visit_id, national_id, full_name, relationship, phone, email)
        VALUES (?,?,?,?,?,?)
    """, (
        visit_id,
        visitor_national_id.strip(),
        visitor_name.strip(),
        relationship,
        phone.strip(),
        email.strip(),
    ))

    db.commit()
    db.close()
    return visit_id, None


@router.get("")
async def public_visit_form(request: Request):
    """PRD 5.1: Public-facing page for visit requests."""
    return templates.TemplateResponse("visits/public.html", {
        "request": request, "success": None, "error": None
    })


@router.get("/context")
async def public_visit_context(inmate_national_id: str = ""):
    inmate, slots, error = get_visit_request_context(inmate_national_id)
    if error:
        return {"success": False, "error": error, "inmate": None, "slots": []}

    return {"success": True, "error": None, "inmate": inmate, "slots": slots}


@router.post("/submit")
async def submit_visit_request_api(request: Request):
    data = await request.json()
    visit_id, error = create_visit_request(
        inmate_national_id=data.get("inmate_national_id", ""),
        visitor_name=data.get("visitor_name", ""),
        visitor_national_id=data.get("visitor_national_id", ""),
        relationship=data.get("relationship", ""),
        phone=data.get("phone", ""),
        email=data.get("email", ""),
        visit_date=data.get("visit_date", ""),
        time_slot=data.get("time_slot", ""),
        visit_type=data.get("visit_type", "Regular"),
    )

    if error:
        return {"success": False, "error": error}

    return {
        "success": True,
        "error": None,
        "reference_number": f"V-{visit_id}",
        "message": f"Visit request submitted successfully! Your reference number is V-{visit_id}.",
    }


@router.post("")
async def submit_visit_request(
    request: Request,
    inmate_national_id: str = Form(...),
    visitor_name: str = Form(...),
    visitor_national_id: str = Form(...),
    relationship: str = Form(...),
    phone: str = Form(""),
    email: str = Form(""),
    visit_date: str = Form(...),
    time_slot: str = Form(...),
    visit_type: str = Form("Regular")
):
    """
    PRD 5.1: Submit a visit request.
    Required inputs per PRD: Inmate National ID, Full Name, Visitor National ID,
    Relationship, Contact info, Time Slot selection.
    """
    visit_id, error = create_visit_request(
        inmate_national_id=inmate_national_id,
        visitor_name=visitor_name,
        visitor_national_id=visitor_national_id,
        relationship=relationship,
        phone=phone,
        email=email,
        visit_date=visit_date,
        time_slot=time_slot,
        visit_type=visit_type,
    )

    if error:
        return templates.TemplateResponse("visits/public.html", {
            "request": request, "success": None,
            "error": error
        })

    return templates.TemplateResponse("visits/public.html", {
        "request": request,
        "success": f"Visit request submitted successfully! Your reference number is V-{visit_id}.",
        "error": None
    })
