"""
Transfer Routes — Inter-prison transfers
PRD Section 4.3: Manager submits, Super Admin approves/denies
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from auth import get_current_user, check_role
from database import get_db
from datetime import datetime

router = APIRouter(prefix="/transfers")
templates = Jinja2Templates(directory="templates")


@router.get("")
async def list_transfers(request: Request):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()
    if user["role"] == "super_admin":
        transfers = db.execute("""
            SELECT t.*, i.full_name as inmate_name,
                   p1.name as from_prison, p2.name as to_prison
            FROM transfers t
            JOIN inmates i ON t.inmate_id = i.inmate_id
            JOIN prisons p1 ON t.requesting_prison = p1.prison_id
            JOIN prisons p2 ON t.destination_prison = p2.prison_id
            ORDER BY CASE t.status WHEN 'Pending' THEN 0 ELSE 1 END, t.transfer_id DESC
        """).fetchall()
    else:
        transfers = db.execute("""
            SELECT t.*, i.full_name as inmate_name,
                   p1.name as from_prison, p2.name as to_prison
            FROM transfers t
            JOIN inmates i ON t.inmate_id = i.inmate_id
            JOIN prisons p1 ON t.requesting_prison = p1.prison_id
            JOIN prisons p2 ON t.destination_prison = p2.prison_id
            WHERE t.requesting_prison = ?
            ORDER BY t.transfer_id DESC
        """, (user["prison_id"],)).fetchall()

    db.close()
    return templates.TemplateResponse("transfers/list.html", {
        "request": request, "user": user, "transfers": transfers
    })


@router.get("/add")
async def add_transfer_form(request: Request):
    """PRD 4.3: Prison Manager submits transfer request."""
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    inmates = db.execute("""
        SELECT * FROM inmates WHERE assigned_prison = ? AND status = 'active'
    """, (user["prison_id"],)).fetchall()
    prisons = db.execute("""
        SELECT * FROM prisons WHERE prison_id != ?
    """, (user["prison_id"],)).fetchall()
    db.close()

    return templates.TemplateResponse("transfers/form.html", {
        "request": request, "user": user, "inmates": inmates, "prisons": prisons
    })


@router.post("/add")
async def add_transfer(
    request: Request,
    inmate_id: int = Form(...), destination_prison: int = Form(...),
    reason: str = Form("")
):
    user = get_current_user(request)
    if not user or not check_role(user, "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    db.execute("""
        INSERT INTO transfers (requesting_prison, destination_prison, reason, inmate_id)
        VALUES (?,?,?,?)
    """, (user["prison_id"], destination_prison, reason, inmate_id))
    db.commit()
    db.close()
    return RedirectResponse(url="/transfers", status_code=302)


@router.post("/{transfer_id}/approve")
async def approve_transfer(request: Request, transfer_id: int):
    """PRD 4.3: Super Admin approves transfer."""
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    transfer = db.execute("SELECT * FROM transfers WHERE transfer_id = ?", (transfer_id,)).fetchone()
    if transfer:
        today = datetime.now().strftime("%Y-%m-%d")
        db.execute("""
            UPDATE transfers SET status = 'Approved', approval_date = ? WHERE transfer_id = ?
        """, (today, transfer_id))

        # Move the inmate to the destination prison, clear block/cell assignment
        db.execute("""
            UPDATE inmates SET assigned_prison = ?, assigned_block = NULL, assigned_cell = NULL,
                              status = 'active'
            WHERE inmate_id = ?
        """, (transfer["destination_prison"], transfer["inmate_id"]))

        # Recompute occupancy for both prisons
        from routes.inmate_routes import update_occupancy
        update_occupancy(db, prison_id=transfer["requesting_prison"])
        update_occupancy(db, prison_id=transfer["destination_prison"])

        db.commit()
    db.close()
    return RedirectResponse(url="/transfers", status_code=302)


@router.post("/{transfer_id}/deny")
async def deny_transfer(request: Request, transfer_id: int):
    """PRD 4.3: Super Admin denies transfer."""
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()
    today = datetime.now().strftime("%Y-%m-%d")
    db.execute("""
        UPDATE transfers SET status = 'Denied', approval_date = ? WHERE transfer_id = ?
    """, (today, transfer_id))
    db.commit()
    db.close()
    return RedirectResponse(url="/transfers", status_code=302)
