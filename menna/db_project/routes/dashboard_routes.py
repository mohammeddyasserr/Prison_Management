"""
Dashboard Routes — Role-specific dashboards
PRD Section 9.1 (Super Admin), 9.2 (Prison Manager), 9.3 (Officer)
"""
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from auth import get_current_user
from database import get_db, rows_to_dicts
from datetime import datetime, timedelta

router = APIRouter()
templates = Jinja2Templates(directory="templates")


@router.get("/dashboard")
async def dashboard(request: Request):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login", status_code=302)

    db = get_db()

    if user["role"] == "super_admin":
        # PRD 9.1 — Super Admin Dashboard
        # Total prisoners per prison (bar chart data)
        prisons = db.execute("""
            SELECT p.prison_id, p.name, p.total_capacity, p.current_occupancy,
                   CASE WHEN p.total_capacity > 0
                        THEN ROUND(p.current_occupancy * 100.0 / p.total_capacity, 1)
                        ELSE 0 END as occupancy_rate
            FROM prisons p
        """).fetchall()

        # Transfer statistics
        transfer_stats = db.execute("""
            SELECT
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'Denied' THEN 1 ELSE 0 END) as denied
            FROM transfers
        """).fetchone()

        # System alerts: prisons with occupancy > 90%
        alerts = db.execute("""
            SELECT name, current_occupancy, total_capacity,
                   ROUND(current_occupancy * 100.0 / total_capacity, 1) as rate
            FROM prisons
            WHERE total_capacity > 0 AND (current_occupancy * 100.0 / total_capacity) > 90
        """).fetchall()

        # High-risk inmates (from incident counts)
        high_risk = db.execute("""
            SELECT i.inmate_id, i.full_name, i.assigned_prison, COUNT(ii.incident_id) as incident_count
            FROM inmates i
            JOIN incident_inmates ii ON i.inmate_id = ii.inmate_id
            WHERE i.status = 'active'
            GROUP BY i.inmate_id
            HAVING incident_count >= 3
            ORDER BY incident_count DESC
            LIMIT 10
        """).fetchall()

        db.close()
        return templates.TemplateResponse("dashboard/superadmin.html", {
            "request": request, "user": user, "prisons": rows_to_dicts(prisons),
            "transfer_stats": transfer_stats, "alerts": alerts, "high_risk": high_risk
        })

    elif user["role"] == "prison_manager":
        # PRD 9.2 — Prison Manager Dashboard
        prison_id = user["prison_id"]
        prison = db.execute("SELECT * FROM prisons WHERE prison_id = ?", (prison_id,)).fetchone()

        # Occupancy by block
        blocks = db.execute("""
            SELECT b.*, 
                   CASE WHEN b.capacity > 0
                        THEN ROUND(b.current_occupancy * 100.0 / b.capacity, 1)
                        ELSE 0 END as occupancy_rate
            FROM blocks b WHERE b.prison_id = ?
        """, (prison_id,)).fetchall()

        # Active incidents count
        active_incidents = db.execute("""
            SELECT COUNT(*) as count FROM incidents WHERE prison_id = ?
        """, (prison_id,)).fetchone()

        # Pending visit requests
        pending_visits = db.execute("""
            SELECT v.*, vis.full_name as visitor_name
            FROM visits v
            LEFT JOIN visitors vis ON v.visit_id = vis.visit_id
            WHERE v.prison_id = ? AND v.status = 'Pending'
        """, (prison_id,)).fetchall()

        # Upcoming releases (next 30 days)
        today = datetime.now().strftime("%Y-%m-%d")
        thirty_days = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        upcoming_releases = db.execute("""
            SELECT * FROM inmates
            WHERE assigned_prison = ? AND status = 'active'
              AND expected_release_date BETWEEN ? AND ?
            ORDER BY expected_release_date
        """, (prison_id, today, thirty_days)).fetchall()

        # Pending transfers
        pending_transfers = db.execute("""
            SELECT t.*, i.full_name as inmate_name, p.name as dest_name
            FROM transfers t
            JOIN inmates i ON t.inmate_id = i.inmate_id
            JOIN prisons p ON t.destination_prison = p.prison_id
            WHERE t.requesting_prison = ? AND t.status = 'Pending'
        """, (prison_id,)).fetchall()

        db.close()
        return templates.TemplateResponse("dashboard/manager.html", {
            "request": request, "user": user, "prison": prison, "blocks": blocks,
            "active_incidents": active_incidents, "pending_visits": pending_visits,
            "upcoming_releases": upcoming_releases, "pending_transfers": pending_transfers
        })

    elif user["role"] == "officer":
        # PRD 9.3 — Officer Dashboard
        prison_id = user["prison_id"]

        # Get blocks assigned to this officer (via shift assignments)
        assigned_blocks = db.execute("""
            SELECT DISTINCT b.*
            FROM shift_assignments sa
            JOIN blocks b ON sa.block_id = b.block_id
            WHERE sa.officer_id = ? AND sa.date >= ?
        """, (user["national_id"], datetime.now().strftime("%Y-%m-%d"))).fetchall()

        assigned_block_ids = [b["block_id"] for b in assigned_blocks]

        # Cell-by-cell occupancy for assigned blocks
        cells = []
        if assigned_block_ids:
            placeholders = ",".join("?" * len(assigned_block_ids))
            cells = db.execute(f"""
                SELECT c.*, b.name as block_name
                FROM cells c
                JOIN blocks b ON c.block_id = b.block_id
                WHERE c.block_id IN ({placeholders})
            """, assigned_block_ids).fetchall()

        # Recent incidents (past 7 days) in assigned blocks
        seven_days_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        recent_incidents = []
        if assigned_block_ids:
            recent_incidents = db.execute(f"""
                SELECT * FROM incidents
                WHERE block_id IN ({placeholders}) AND date_time >= ?
                ORDER BY date_time DESC
            """, assigned_block_ids + [seven_days_ago]).fetchall()

        # Active solitary confinement records
        active_solitary = db.execute("""
            SELECT dl.*, i.full_name
            FROM disciplinary_logs dl
            JOIN inmates i ON dl.inmate_id = i.inmate_id
            WHERE dl.punishment_type = 'Solitary Confinement'
              AND dl.end_date >= ?
              AND i.assigned_prison = ?
        """, (datetime.now().strftime("%Y-%m-%d"), prison_id)).fetchall()

        # Officer's own shift schedule
        my_shifts = db.execute("""
            SELECT sa.*, b.name as block_name
            FROM shift_assignments sa
            JOIN blocks b ON sa.block_id = b.block_id
            WHERE sa.officer_id = ? AND sa.date >= ?
            ORDER BY sa.date, sa.start_time
            LIMIT 14
        """, (user["national_id"], datetime.now().strftime("%Y-%m-%d"))).fetchall()

        db.close()
        return templates.TemplateResponse("dashboard/officer.html", {
            "request": request, "user": user, "assigned_blocks": assigned_blocks,
            "cells": cells, "recent_incidents": recent_incidents,
            "active_solitary": active_solitary, "my_shifts": my_shifts
        })

    db.close()
    return RedirectResponse(url="/login", status_code=302)
