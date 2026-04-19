"""
Prison Routes — CRUD for Prisons, Blocks, Cells
PRD Sections 2.2.1 (Prisons), 2.2.2 (Blocks & Cells), 2.2.5 (Features)
PRD Section 3.1: Super Admin can add, edit, deactivate prisons
PRD Section 3.2: Prison Manager can view occupancy at block/cell level
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from auth import get_current_user, check_role
from database import get_db
from typing import Optional

router = APIRouter(prefix="/prisons")
templates = Jinja2Templates(directory="templates")


@router.get("")
async def list_prisons(request: Request):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()
    if user["role"] == "super_admin":
        prisons = db.execute("""
            SELECT p.*, u.name as manager_name
            FROM prisons p LEFT JOIN users u ON p.manager_id = u.national_id
        """).fetchall()
    else:
        # Manager/Officer sees only their prison
        prisons = db.execute("""
            SELECT p.*, u.name as manager_name
            FROM prisons p LEFT JOIN users u ON p.manager_id = u.national_id
            WHERE p.prison_id = ?
        """, (user["prison_id"],)).fetchall()

    db.close()
    return templates.TemplateResponse("prisons/list.html", {
        "request": request, "user": user, "prisons": prisons
    })


@router.get("/add")
async def add_prison_form(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin"):
        return RedirectResponse(url="/dashboard", status_code=302)
    db = get_db()
    managers = db.execute("SELECT * FROM users WHERE role = 'prison_manager'").fetchall()
    db.close()
    return templates.TemplateResponse("prisons/form.html", {
        "request": request, "user": user, "prison": None, "features": None, "managers": managers
    })


@router.post("/add")
async def add_prison(
    request: Request,
    name: str = Form(...), location: str = Form(...),
    type: str = Form(...), security_level: str = Form(...),
    total_capacity: int = Form(...), manager_id: str = Form(""),
    infirmary: int = Form(0), workshops: int = Form(0),
    agricultural_ward: int = Form(0), visitation_hall: int = Form(0),
    visitation_hall_capacity: int = Form(0)
):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    cursor = db.execute(
        "INSERT INTO prisons (name, location, type, security_level, total_capacity, manager_id) VALUES (?,?,?,?,?,?)",
        (name, location, type, security_level, total_capacity, manager_id or None)
    )
    prison_id = cursor.lastrowid

    db.execute(
        "INSERT INTO prison_features (prison_id, infirmary, workshops, agricultural_ward, visitation_hall, visitation_hall_capacity) VALUES (?,?,?,?,?,?)",
        (prison_id, infirmary, workshops, agricultural_ward, visitation_hall, visitation_hall_capacity)
    )

    # If manager assigned, update their prison_id
    if manager_id:
        db.execute("UPDATE users SET prison_id = ? WHERE national_id = ?", (prison_id, manager_id))

    db.commit()
    db.close()
    return RedirectResponse(url="/prisons", status_code=302)


@router.get("/{prison_id}")
async def prison_detail(request: Request, prison_id: int):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()
    prison = db.execute("""
        SELECT p.*, u.name as manager_name
        FROM prisons p LEFT JOIN users u ON p.manager_id = u.national_id
        WHERE p.prison_id = ?
    """, (prison_id,)).fetchone()

    if not prison:
        db.close()
        return RedirectResponse(url="/prisons", status_code=302)

    features = db.execute("SELECT * FROM prison_features WHERE prison_id = ?", (prison_id,)).fetchone()
    blocks = db.execute("SELECT * FROM blocks WHERE prison_id = ?", (prison_id,)).fetchall()

    # Get cells for each block
    block_cells = {}
    for block in blocks:
        cells = db.execute("SELECT * FROM cells WHERE block_id = ?", (block["block_id"],)).fetchall()
        block_cells[block["block_id"]] = cells

    db.close()
    return templates.TemplateResponse("prisons/detail.html", {
        "request": request, "user": user, "prison": prison,
        "features": features, "blocks": blocks, "block_cells": block_cells
    })


@router.get("/{prison_id}/edit")
async def edit_prison_form(request: Request, prison_id: int):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    prison = db.execute("SELECT * FROM prisons WHERE prison_id = ?", (prison_id,)).fetchone()
    features = db.execute("SELECT * FROM prison_features WHERE prison_id = ?", (prison_id,)).fetchone()
    managers = db.execute("SELECT * FROM users WHERE role = 'prison_manager'").fetchall()
    db.close()
    return templates.TemplateResponse("prisons/form.html", {
        "request": request, "user": user, "prison": prison, "features": features, "managers": managers
    })


@router.post("/{prison_id}/edit")
async def edit_prison(
    request: Request, prison_id: int,
    name: str = Form(...), location: str = Form(...),
    type: str = Form(...), security_level: str = Form(...),
    total_capacity: int = Form(...), manager_id: str = Form(""),
    infirmary: int = Form(0), workshops: int = Form(0),
    agricultural_ward: int = Form(0), visitation_hall: int = Form(0),
    visitation_hall_capacity: int = Form(0)
):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    db.execute("""
        UPDATE prisons SET name=?, location=?, type=?, security_level=?, total_capacity=?, manager_id=?
        WHERE prison_id=?
    """, (name, location, type, security_level, total_capacity, manager_id or None, prison_id))

    db.execute("""
        INSERT OR REPLACE INTO prison_features
        (prison_id, infirmary, workshops, agricultural_ward, visitation_hall, visitation_hall_capacity)
        VALUES (?,?,?,?,?,?)
    """, (prison_id, infirmary, workshops, agricultural_ward, visitation_hall, visitation_hall_capacity))

    if manager_id:
        db.execute("UPDATE users SET prison_id = ? WHERE national_id = ?", (prison_id, manager_id))

    db.commit()
    db.close()
    return RedirectResponse(url=f"/prisons/{prison_id}", status_code=302)


# ── Block Management ──

@router.post("/{prison_id}/blocks/add")
async def add_block(
    request: Request, prison_id: int,
    name: str = Form(...), capacity: int = Form(...),
    security_level: str = Form(...), number_of_cells: int = Form(0)
):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin", "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    db.execute(
        "INSERT INTO blocks (prison_id, name, capacity, security_level, number_of_cells) VALUES (?,?,?,?,?)",
        (prison_id, name, capacity, security_level, number_of_cells)
    )
    db.commit()
    db.close()
    return RedirectResponse(url=f"/prisons/{prison_id}", status_code=302)


# ── Cell Management ──

@router.post("/{prison_id}/blocks/{block_id}/cells/add")
async def add_cell(
    request: Request, prison_id: int, block_id: int,
    capacity: int = Form(...)
):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin", "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    db.execute(
        "INSERT INTO cells (block_id, prison_id, capacity) VALUES (?,?,?)",
        (block_id, prison_id, capacity)
    )
    # Update block's number_of_cells
    db.execute("""
        UPDATE blocks SET number_of_cells = (SELECT COUNT(*) FROM cells WHERE block_id = ?)
        WHERE block_id = ?
    """, (block_id, block_id))
    db.commit()
    db.close()
    return RedirectResponse(url=f"/prisons/{prison_id}", status_code=302)
