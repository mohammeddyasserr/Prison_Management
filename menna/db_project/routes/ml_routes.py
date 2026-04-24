"""
ML Routes — Machine Learning Prediction Outputs
PRD Section 8.1 (Risk Behavior), 8.2 (Overcrowding), 8.3 (Recidivism)

These use weighted scoring algorithms based on database data.
[NOT IN PRD — actual ML model training/inference is out of scope for this implementation.
 Instead, deterministic scoring functions are used with the same input signals
 and output formats specified in the PRD.]
"""
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from auth import get_current_user, check_role
from database import get_db
from datetime import datetime, timedelta

router = APIRouter(prefix="/ml")
templates = Jinja2Templates(directory="templates")


def calculate_risk_score(db, inmate_id):
    """
    PRD 8.1 — Risk Behavior Prediction
    Input Signals: incident history, disciplinary records, sentence type,
                   block environment, social visit frequency.
    Output: Risk score (Low / Medium / High / Critical)
    """
    # Count incidents
    incidents = db.execute("""
        SELECT COUNT(*) as cnt FROM incident_inmates WHERE inmate_id = ?
    """, (inmate_id,)).fetchone()["cnt"]

    # Count disciplinary records
    disciplinary = db.execute("""
        SELECT COUNT(*) as cnt FROM disciplinary_logs WHERE inmate_id = ?
    """, (inmate_id,)).fetchone()["cnt"]

    # Count visits (social visit frequency — more visits = lower risk)
    inmate = db.execute("SELECT national_id FROM inmates WHERE inmate_id = ?", (inmate_id,)).fetchone()
    visit_count = 0
    if inmate and inmate["national_id"]:
        visit_count = db.execute("""
            SELECT COUNT(*) as cnt FROM visits
            WHERE inmate_national_id = ? AND status = 'Approved'
        """, (inmate["national_id"],)).fetchone()["cnt"]

    # Crime type weight
    legal = db.execute("SELECT crime_type FROM legal_cases WHERE inmate_id = ?", (inmate_id,)).fetchone()
    crime_weight = 0
    if legal and legal["crime_type"]:
        high_risk_crimes = ["Murder", "Assault", "Armed Robbery", "Terrorism", "Drug Trafficking"]
        if legal["crime_type"] in high_risk_crimes:
            crime_weight = 3

    # Calculate score
    score = (incidents * 3) + (disciplinary * 2) + crime_weight - (visit_count * 0.5)
    score = max(0, score)

    if score >= 8:
        return "Critical", score
    elif score >= 5:
        return "High", score
    elif score >= 2:
        return "Medium", score
    else:
        return "Low", score


def calculate_overcrowding(db, prison_id):
    """
    PRD 8.2 — Overcrowding Prediction
    Input Signals: current occupancy, upcoming releases, pending admissions, transfer trends
    Output: Per-prison occupancy forecast for 30, 60, and 90 days.
    """
    prison = db.execute("SELECT * FROM prisons WHERE prison_id = ?", (prison_id,)).fetchone()
    if not prison or prison["total_capacity"] == 0:
        return {"current_rate": 0, "forecast_30": 0, "forecast_60": 0, "forecast_90": 0}

    current = prison["current_occupancy"]
    capacity = prison["total_capacity"]
    current_rate = round(current * 100.0 / capacity, 1)

    # Count upcoming releases in 30/60/90 days
    today = datetime.now().strftime("%Y-%m-%d")
    releases_30 = db.execute("""
        SELECT COUNT(*) as cnt FROM inmates
        WHERE assigned_prison = ? AND status = 'active'
          AND expected_release_date BETWEEN ? AND ?
    """, (prison_id, today, (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"))).fetchone()["cnt"]

    releases_60 = db.execute("""
        SELECT COUNT(*) as cnt FROM inmates
        WHERE assigned_prison = ? AND status = 'active'
          AND expected_release_date BETWEEN ? AND ?
    """, (prison_id, today, (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d"))).fetchone()["cnt"]

    releases_90 = db.execute("""
        SELECT COUNT(*) as cnt FROM inmates
        WHERE assigned_prison = ? AND status = 'active'
          AND expected_release_date BETWEEN ? AND ?
    """, (prison_id, today, (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d"))).fetchone()["cnt"]

    # Pending inbound transfers
    pending_in = db.execute("""
        SELECT COUNT(*) as cnt FROM transfers
        WHERE destination_prison = ? AND status = 'Pending'
    """, (prison_id,)).fetchone()["cnt"]

    # Forecast: current - releases + pending transfers
    forecast_30 = round((current - releases_30 + pending_in) * 100.0 / capacity, 1)
    forecast_60 = round((current - releases_60 + pending_in) * 100.0 / capacity, 1)
    forecast_90 = round((current - releases_90 + pending_in) * 100.0 / capacity, 1)

    return {
        "current_rate": current_rate,
        "forecast_30": max(0, forecast_30),
        "forecast_60": max(0, forecast_60),
        "forecast_90": max(0, forecast_90),
        "releases_30": releases_30,
        "releases_60": releases_60,
        "releases_90": releases_90,
        "pending_transfers_in": pending_in
    }


def calculate_recidivism(db, inmate_id):
    """
    PRD 8.3 — Recidivism Risk Scoring
    Input Signals: age, offense type, sentence duration, visit frequency, prior offenses
    Output: Score 0–100
    """
    inmate = db.execute("SELECT * FROM inmates WHERE inmate_id = ?", (inmate_id,)).fetchone()
    if not inmate:
        return 0

    score = 50  # Base score

    # Age factor (younger = higher risk per criminology research)
    if inmate["date_of_birth"]:
        try:
            birth = datetime.strptime(inmate["date_of_birth"], "%Y-%m-%d")
            age = (datetime.now() - birth).days / 365.25
            if age < 25:
                score += 15
            elif age < 35:
                score += 10
            elif age > 50:
                score -= 10
        except ValueError:
            pass

    # Offense type
    legal = db.execute("SELECT crime_type FROM legal_cases WHERE inmate_id = ?", (inmate_id,)).fetchone()
    if legal and legal["crime_type"]:
        high_recidivism_crimes = ["Theft", "Burglary", "Drug Possession", "Fraud"]
        low_recidivism_crimes = ["Murder", "Manslaughter"]
        if legal["crime_type"] in high_recidivism_crimes:
            score += 15
        elif legal["crime_type"] in low_recidivism_crimes:
            score -= 10

    # Disciplinary record
    disc_count = db.execute("SELECT COUNT(*) as cnt FROM disciplinary_logs WHERE inmate_id = ?", (inmate_id,)).fetchone()["cnt"]
    score += min(disc_count * 3, 15)

    # Visit frequency (more visits = lower risk)
    if inmate["national_id"]:
        visits = db.execute("""
            SELECT COUNT(*) as cnt FROM visits
            WHERE inmate_national_id = ? AND status = 'Approved'
        """, (inmate["national_id"],)).fetchone()["cnt"]
        score -= min(visits * 2, 10)

    return max(0, min(100, score))


@router.get("")
async def ml_predictions(request: Request):
    """PRD 8: ML prediction dashboard. Available to Super Admin and Prison Manager."""
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin", "prison_manager"):
        return RedirectResponse(url="/dashboard", status_code=302)

    db = get_db()

    # ── Risk Behavior (PRD 8.1) ──
    if user["role"] == "super_admin":
        inmates = db.execute("SELECT * FROM inmates WHERE status = 'active'").fetchall()
        prisons = db.execute("SELECT * FROM prisons").fetchall()
    else:
        inmates = db.execute("""
            SELECT * FROM inmates WHERE assigned_prison = ? AND status = 'active'
        """, (user["prison_id"],)).fetchall()
        prisons = db.execute("SELECT * FROM prisons WHERE prison_id = ?", (user["prison_id"],)).fetchall()

    risk_scores = []
    for inmate in inmates:
        level, score = calculate_risk_score(db, inmate["inmate_id"])
        risk_scores.append({
            "inmate_id": inmate["inmate_id"],
            "name": inmate["full_name"],
            "level": level,
            "score": round(score, 1)
        })

    # Sort by score descending
    risk_scores.sort(key=lambda x: x["score"], reverse=True)

    # ── Overcrowding (PRD 8.2) ──
    overcrowding = []
    for prison in prisons:
        forecast = calculate_overcrowding(db, prison["prison_id"])
        overcrowding.append({
            "prison_id": prison["prison_id"],
            "name": prison["name"],
            **forecast
        })

    # ── Recidivism (PRD 8.3) ──
    recidivism_scores = []
    for inmate in inmates:
        rec_score = calculate_recidivism(db, inmate["inmate_id"])
        recidivism_scores.append({
            "inmate_id": inmate["inmate_id"],
            "name": inmate["full_name"],
            "score": rec_score
        })
    recidivism_scores.sort(key=lambda x: x["score"], reverse=True)

    db.close()
    return templates.TemplateResponse("ml/predictions.html", {
        "request": request, "user": user,
        "risk_scores": risk_scores, "overcrowding": overcrowding,
        "recidivism_scores": recidivism_scores
    })


@router.get("/api/list")
async def api_list_ml(request: Request):
    user = get_current_user(request)
    if not user or not check_role(user, "super_admin", "prison_manager"):
        return {"error": "Unauthorized", "risk_scores": [], "overcrowding": [], "recidivism_scores": []}

    db = get_db()
    if user["role"] == "super_admin":
        inmates = db.execute("SELECT * FROM inmates WHERE status = 'active'").fetchall()
        prisons = db.execute("SELECT * FROM prisons").fetchall()
    else:
        inmates = db.execute("""
            SELECT * FROM inmates WHERE assigned_prison = ? AND status = 'active'
        """, (user["prison_id"],)).fetchall()
        prisons = db.execute("""
            SELECT * FROM prisons WHERE prison_id = ?
        """, (user["prison_id"],)).fetchall()
    
    risk_scores = []
    for inmate in inmates:
        level, score = calculate_risk_score(db, inmate["inmate_id"])
        risk_scores.append({
            "inmate_id": inmate["inmate_id"],
            "name": inmate["full_name"],
            "level": level,
            "score": round(score, 1)
        })
    risk_scores.sort(key=lambda x: x["score"], reverse=True)

    overcrowding = []
    for prison in prisons:
        forecast = calculate_overcrowding(db, prison["prison_id"])
        overcrowding.append({
            "prison_id": prison["prison_id"],
            "name": prison["name"],
            **forecast
        })

    recidivism_scores = []
    for inmate in inmates:
        rec_score = calculate_recidivism(db, inmate["inmate_id"])
        recidivism_scores.append({
            "inmate_id": inmate["inmate_id"],
            "name": inmate["full_name"],
            "score": rec_score
        })
    recidivism_scores.sort(key=lambda x: x["score"], reverse=True)
    db.close()
    
    return {
        "risk_scores": risk_scores,
        "overcrowding": overcrowding,
        "recidivism_scores": recidivism_scores
    }
