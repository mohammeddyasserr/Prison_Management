"""
Public Visit Request Portal
PRD Section 3.4 & 5.1: Anyone can submit a visit request without an account.
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from database import get_db

router = APIRouter(prefix="/visit-request")
templates = Jinja2Templates(directory="templates")


@router.get("")
async def public_visit_form(request: Request):
    """PRD 5.1: Public-facing page for visit requests."""
    return templates.TemplateResponse("visits/public.html", {
        "request": request, "success": None, "error": None
    })


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
    db = get_db()

    # Find the inmate by national ID
    inmate = db.execute("""
        SELECT * FROM inmates WHERE national_id = ? AND status = 'active'
    """, (inmate_national_id,)).fetchone()

    if not inmate:
        db.close()
        return templates.TemplateResponse("visits/public.html", {
            "request": request, "success": None,
            "error": "No active inmate found with this National ID."
        })

    # Create the visit record
    cursor = db.execute("""
        INSERT INTO visits (inmate_national_id, visit_date, time_slot, duration, status, visit_type, prison_id)
        VALUES (?, ?, ?, 30, 'Pending', ?, ?)
    """, (inmate_national_id, visit_date, time_slot, visit_type, inmate["assigned_prison"]))

    visit_id = cursor.lastrowid

    # Create the visitor record (PRD 5.2: Visitor Data Model)
    db.execute("""
        INSERT INTO visitors (visit_id, national_id, full_name, relationship, phone, email)
        VALUES (?,?,?,?,?,?)
    """, (visit_id, visitor_national_id, visitor_name, relationship, phone, email))

    db.commit()
    db.close()

    return templates.TemplateResponse("visits/public.html", {
        "request": request,
        "success": f"Visit request submitted successfully! Your reference number is V-{visit_id}.",
        "error": None
    })
