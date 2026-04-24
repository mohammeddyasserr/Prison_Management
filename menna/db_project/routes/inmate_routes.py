"""
Inmate Routes — Inmate management, placement, legal cases
PRD Sections 4.1 (Placement Workflow), 4.2 (Data Model)
PRD 3.1: Super Admin assigns inmate to prison
PRD 3.2: Prison Manager assigns inmate to block/cell
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from auth import get_current_user, check_role
from database import get_db
from typing import Optional

router = APIRouter(prefix="/inmates")
templates = Jinja2Templates(directory="templates")


def update_occupancy(db, prison_id=None, block_id=None, cell_id=None):
    """Recompute current_occupancy for affected entities."""
    if cell_id:
        db.execute("""
            UPDATE cells SET current_occupancy = (
                SELECT COUNT(*) FROM inmates WHERE assigned_cell = ? AND status = 'active'
            ) WHERE cell_id = ?
        """, (cell_id, cell_id))
    if block_id:
        db.execute("""
            UPDATE blocks SET current_occupancy = (
                SELECT COUNT(*) FROM inmates WHERE assigned_block = ? AND status = 'active'
            ) WHERE block_id = ?
        """, (block_id, block_id))
    if prison_id:
        db.execute("""
            UPDATE prisons SET current_occupancy = (
                SELECT COUNT(*) FROM inmates WHERE assigned_prison = ? AND status = 'active'
            ) WHERE prison_id = ?
        """, (prison_id, prison_id))


@router.get("")
async def list_inmates(request: Request):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()
    if user["role"] == "super_admin":
        inmates = db.execute("""
            SELECT i.*, p.name as prison_name
            FROM inmates i LEFT JOIN prisons p ON i.assigned_prison = p.prison_id
            WHERE i.status = 'active'
            ORDER BY i.full_name
        """).fetchall()
    elif user["role"] == "prison_manager":
        inmates = db.execute("""
            SELECT i.*, p.name as prison_name
            FROM inmates i LEFT JOIN prisons p ON i.assigned_prison = p.prison_id
            WHERE i.assigned_prison = ? AND i.status = 'active'
            ORDER BY i.full_name
        """, (user["prison_id"],)).fetchall()
    else:
        # Officer: only inmates in their assigned blocks
        inmates = db.execute("""
            SELECT DISTINCT i.*, p.name as prison_name
            FROM inmates i
            LEFT JOIN prisons p ON i.assigned_prison = p.prison_id
            JOIN shift_assignments sa ON i.assigned_block = sa.block_id
            WHERE sa.officer_id = ? AND i.status = 'active'
            ORDER BY i.full_name
        """, (user["national_id"],)).fetchall()

    db.close()
    return templates.TemplateResponse("inmates/list.html", {
        "request": request, "user": user, "inmates": inmates
    })


@router.get("/api/list")
async def api_list_inmates(request: Request):
    user = get_current_user(request)
    if not user:
        return {"error": "Unauthorized", "inmates": []}

    db = get_db()
    if user["role"] == "super_admin":
        inmates = db.execute("""
            SELECT i.*, p.name as prison_name
            FROM inmates i LEFT JOIN prisons p ON i.assigned_prison = p.prison_id
            WHERE i.status = 'active'
            ORDER BY i.full_name
        """).fetchall()
    elif user["role"] == "prison_manager":
        inmates = db.execute("""
            SELECT i.*, p.name as prison_name
            FROM inmates i LEFT JOIN prisons p ON i.assigned_prison = p.prison_id
            WHERE i.assigned_prison = ? AND i.status = 'active'
            ORDER BY i.full_name
        """, (user["prison_id"],)).fetchall()
    else:
        inmates = db.execute("""
            SELECT DISTINCT i.*, p.name as prison_name
            FROM inmates i
            LEFT JOIN prisons p ON i.assigned_prison = p.prison_id
            JOIN shift_assignments sa ON i.assigned_block = sa.block_id
            WHERE sa.officer_id = ? AND i.status = 'active'
            ORDER BY i.full_name
        """, (user["national_id"],)).fetchall()
    db.close()
    
    from database import rows_to_dicts
    return {"inmates": rows_to_dicts(inmates)}


@router.get("/api/detail/{inmate_id}")
async def api_inmate_detail(request: Request, inmate_id: int):
    user = get_current_user(request)
    if not user:
        return {"error": "Unauthorized"}

    db = get_db()
    inmate = db.execute("""
        SELECT i.*, p.name as prison_name, b.name as block_name
        FROM inmates i
        LEFT JOIN prisons p ON i.assigned_prison = p.prison_id
        LEFT JOIN blocks b ON i.assigned_block = b.block_id
        WHERE i.inmate_id = ?
    """, (inmate_id,)).fetchone()
    
    if not inmate:
        db.close()
        return {"error": "Inmate not found"}, 404

    legal_case = db.execute("SELECT * FROM legal_cases WHERE inmate_id = ?", (inmate_id,)).fetchone()
    
    incidents = db.execute("""
        SELECT inc.* FROM incidents inc
        JOIN incident_inmates ii ON inc.incident_id = ii.incident_id
        WHERE ii.inmate_id = ?
        ORDER BY inc.date_time DESC
    """, (inmate_id,)).fetchall()
    
    disciplinary = db.execute("""
        SELECT * FROM disciplinary_logs WHERE inmate_id = ?
        ORDER BY date_imposed DESC
    """, (inmate_id,)).fetchall()
    
    medical = db.execute("""
        SELECT mv.*, d.name as doctor_name FROM medical_visits mv
        JOIN doctors d ON mv.doctor_id = d.national_id
        WHERE mv.inmate_id = ?
        ORDER BY mv.date_time DESC
    """, (inmate_id,)).fetchall()
    
    from database import rows_to_dicts
    db.close()
    return {
        "inmate": dict(inmate),
        "legal_case": dict(legal_case) if legal_case else None,
        "incidents": rows_to_dicts(incidents),
        "disciplinary": rows_to_dicts(disciplinary),
        "medical": rows_to_dicts(medical)
    }


@router.get("/add")
async def add_inmate_form(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    prisons = db.execute("SELECT * FROM prisons").fetchall()
    db.close()
    return templates.TemplateResponse("inmates/form.html", {
        "request": request, "user": user, "inmate": None, "prisons": prisons,
        "legal_case": None, "blocks": [], "cells": []
    })


@router.get("/api/form-data")
async def api_inmate_form_data(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin"):
        return {"error": "Unauthorized", "prisons": []}

    db = get_db()
    prisons = db.execute("SELECT * FROM prisons").fetchall()
    from database import rows_to_dicts
    db.close()
    return {"prisons": rows_to_dicts(prisons)}


@router.post("/add")
async def add_inmate(
    request: Request,
    full_name: str = Form(...), date_of_birth: str = Form(""),
    gender: str = Form("Male"), nationality: str = Form(""),
    occupation: str = Form(""), national_id: str = Form(""),
    start_date: str = Form(""), expected_release_date: str = Form(""),
    assigned_prison: int = Form(0),
    case_number: str = Form(""), crime_type: str = Form(""),
    court_name: str = Form(""), sentence_duration: str = Form("")
):
    """PRD 4.1: Super Admin assigns inmate to a prison."""
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    cursor = db.execute("""
        INSERT INTO inmates (full_name, date_of_birth, gender, nationality, occupation,
                            national_id, start_date, expected_release_date, assigned_prison)
        VALUES (?,?,?,?,?,?,?,?,?)
    """, (full_name, date_of_birth or None, gender, nationality, occupation,
          national_id or None, start_date or None, expected_release_date or None,
          assigned_prison if assigned_prison else None))

    inmate_id = cursor.lastrowid

    # Add legal case if provided
    if case_number:
        db.execute("""
            INSERT INTO legal_cases (case_number, crime_type, court_name, sentence_duration, inmate_id)
            VALUES (?,?,?,?,?)
        """, (case_number, crime_type, court_name, sentence_duration, inmate_id))

    # Update occupancy
    if assigned_prison:
        update_occupancy(db, prison_id=assigned_prison)

    db.commit()
    db.close()
    return RedirectResponse(url="/inmates", status_code=302)


@router.get("/{inmate_id}")
async def inmate_detail(request: Request, inmate_id: int):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()
    inmate = db.execute("""
        SELECT i.*, p.name as prison_name, b.name as block_name
        FROM inmates i
        LEFT JOIN prisons p ON i.assigned_prison = p.prison_id
        LEFT JOIN blocks b ON i.assigned_block = b.block_id
        WHERE i.inmate_id = ?
    """, (inmate_id,)).fetchone()

    if not inmate:
        db.close()
        return RedirectResponse(url="/inmates", status_code=302)

    legal_case = db.execute("SELECT * FROM legal_cases WHERE inmate_id = ?", (inmate_id,)).fetchone()

    # Incident history
    incidents = db.execute("""
        SELECT inc.* FROM incidents inc
        JOIN incident_inmates ii ON inc.incident_id = ii.incident_id
        WHERE ii.inmate_id = ?
        ORDER BY inc.date_time DESC
    """, (inmate_id,)).fetchall()

    # Disciplinary history
    disciplinary = db.execute("""
        SELECT * FROM disciplinary_logs WHERE inmate_id = ?
        ORDER BY date_imposed DESC
    """, (inmate_id,)).fetchall()

    # Medical history
    medical = db.execute("""
        SELECT mv.*, d.name as doctor_name
        FROM medical_visits mv
        JOIN doctors d ON mv.doctor_id = d.national_id
        WHERE mv.inmate_id = ?
        ORDER BY mv.date_time DESC
    """, (inmate_id,)).fetchall()

    db.close()
    return templates.TemplateResponse("inmates/detail.html", {
        "request": request, "user": user, "inmate": inmate,
        "legal_case": legal_case, "incidents": incidents,
        "disciplinary": disciplinary, "medical": medical
    })


@router.get("/{inmate_id}/assign")
async def assign_inmate_form(request: Request, inmate_id: int):
    """PRD 4.1: Prison Manager assigns inmate to block/cell."""
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    inmate = db.execute("SELECT * FROM inmates WHERE inmate_id = ?", (inmate_id,)).fetchone()
    blocks = db.execute("SELECT * FROM blocks WHERE prison_id = ?", (user["prison_id"],)).fetchall()

    block_cells = {}
    for block in blocks:
        cells = db.execute("""
            SELECT * FROM cells WHERE block_id = ? AND current_occupancy < capacity
        """, (block["block_id"],)).fetchall()
        block_cells[block["block_id"]] = cells

    db.close()
    return templates.TemplateResponse("inmates/assign.html", {
        "request": request, "user": user, "inmate": inmate,
        "blocks": blocks, "block_cells": block_cells
    })


@router.get("/api/assign-data/{inmate_id}")
async def api_inmate_assign_data(request: Request, inmate_id: int):
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return {"error": "Unauthorized"}

    db = get_db()
    inmate = db.execute("SELECT * FROM inmates WHERE inmate_id = ?", (inmate_id,)).fetchone()
    if not inmate:
        db.close()
        return {"error": "Inmate not found"}, 404
        
    blocks = db.execute("SELECT * FROM blocks WHERE prison_id = ?", (user["prison_id"],)).fetchall()

    block_cells = {}
    from database import rows_to_dicts
    for block in blocks:
        cells = db.execute("""
            SELECT * FROM cells WHERE block_id = ? AND current_occupancy < capacity
        """, (block["block_id"],)).fetchall()
        block_cells[block["block_id"]] = rows_to_dicts(cells)

    db.close()
    return {
        "inmate": dict(inmate),
        "blocks": rows_to_dicts(blocks),
        "block_cells": block_cells
    }


@router.post("/{inmate_id}/assign")
async def assign_inmate(
    request: Request, inmate_id: int,
    block_id: int = Form(...), cell_id: int = Form(...)
):
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    # Get old assignment for occupancy update
    old = db.execute("SELECT assigned_block, assigned_cell FROM inmates WHERE inmate_id = ?", (inmate_id,)).fetchone()

    db.execute("""
        UPDATE inmates SET assigned_block = ?, assigned_cell = ? WHERE inmate_id = ?
    """, (block_id, cell_id, inmate_id))

    # Update old occupancy
    if old and old["assigned_cell"]:
        update_occupancy(db, cell_id=old["assigned_cell"])
    if old and old["assigned_block"]:
        update_occupancy(db, block_id=old["assigned_block"])

    # Update new occupancy
    update_occupancy(db, cell_id=cell_id, block_id=block_id, prison_id=user["prison_id"])

    db.commit()
    db.close()
    return RedirectResponse(url=f"/inmates/{inmate_id}", status_code=302)


@router.post("/{inmate_id}/release")
async def release_inmate(request: Request, inmate_id: int):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin", "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    inmate = db.execute("SELECT * FROM inmates WHERE inmate_id = ?", (inmate_id,)).fetchone()

    db.execute("UPDATE inmates SET status = 'released' WHERE inmate_id = ?", (inmate_id,))

    # Update occupancy
    if inmate:
        update_occupancy(db, prison_id=inmate["assigned_prison"],
                        block_id=inmate["assigned_block"],
                        cell_id=inmate["assigned_cell"])

    db.commit()
    db.close()
    return RedirectResponse(url="/inmates", status_code=302)
