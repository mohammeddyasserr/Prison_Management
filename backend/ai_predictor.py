import os
import joblib
import pandas as pd
import traceback
from datetime import date
from sqlmodel import text
from database import SessionDep

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RISK_BEHAVIOR_MODEL_PATH = os.path.join(BASE_DIR, "ai_service", "models", "risk_behavior_pipeline.pkl")
RECIDIVISM_MODEL_PATH = os.path.join(BASE_DIR, "ai_service", "models", "recidivism_score_pipeline.pkl")

RISK_LEVEL_MAP = {
    0: "High",
    1: "Low",
    2: "Medium"
}

_risk_behavior_model = None
_recidivism_model = None
_models_loaded = False


def _load_models():
    global _risk_behavior_model, _recidivism_model, _models_loaded
    if _models_loaded:
        return

    print(f"Loading AI models from: {BASE_DIR}")
    print(f"Risk behavior model path: {RISK_BEHAVIOR_MODEL_PATH}")
    print(f"Recidivism model path: {RECIDIVISM_MODEL_PATH}")
    print(f"Risk behavior model exists: {os.path.exists(RISK_BEHAVIOR_MODEL_PATH)}")
    print(f"Recidivism model exists: {os.path.exists(RECIDIVISM_MODEL_PATH)}")

    try:
        _risk_behavior_model = joblib.load('../ai_service/models/risk_behavior_pipeline.pkl')
        print("Risk behavior model loaded successfully")
    except Exception as e:
        print(f"Failed to load risk behavior model: {e}")
        traceback.print_exc()

    try:
        _recidivism_model = joblib.load('../ai_service/models/recidivism_score_pipeline.pkl')
        print("Recidivism model loaded successfully")
    except Exception as e:
        print(f"Failed to load recidivism model: {e}")
        traceback.print_exc()

    _models_loaded = True
    print(f"Models loaded - Risk Behavior: {_risk_behavior_model is not None}, Recidivism: {_recidivism_model is not None}")


def _get_inmate_features(db: SessionDep, inmate_id: int) -> dict:
    inmate_row = db.execute(text("""
        SELECT i.date_of_birth, i.gender, i.education_level, i.assigned_prison, i.start_date
        FROM inmate i
        WHERE i.inmate_id = :id
    """), {"id": inmate_id}).fetchone()

    if not inmate_row:
        raise ValueError(f"Inmate {inmate_id} not found")

    dob, gender, education_level, assigned_prison, start_date = inmate_row

    today = date.today()
    try:
        birth_date = date.fromisoformat(dob) if isinstance(dob, str) else dob
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    except Exception:
        age = 30

    prison_row = db.execute(text("""
        SELECT p.type, p.security_level
        FROM prison p
        WHERE p.prison_id = :pid
    """), {"pid": assigned_prison}).fetchone()

    prison_type = prison_row[0] if prison_row else "Unknown"
    prison_security_level = prison_row[1] if prison_row else "Unknown"

    incidents_count = db.execute(text("""
        SELECT COUNT(*) FROM incident_involvement WHERE inmate_id = :id
    """), {"id": inmate_id}).scalar() or 0

    violent_count = db.execute(text("""
        SELECT COUNT(*) FROM incident_involvement inv
        JOIN incident i ON i.incident_id = inv.incident_id
        WHERE inv.inmate_id = :id AND i.type IN ('Fight', 'Assault on Staff')
    """), {"id": inmate_id}).scalar() or 0

    escape_count = db.execute(text("""
        SELECT COUNT(*) FROM incident_involvement inv
        JOIN incident i ON i.incident_id = inv.incident_id
        WHERE inv.inmate_id = :id AND i.type = 'Escape Attempt'
    """), {"id": inmate_id}).scalar() or 0

    last_incident_row = db.execute(text("""
        SELECT MAX(i.occurred_at) FROM incident_involvement inv
        JOIN incident i ON i.incident_id = inv.incident_id
        WHERE inv.inmate_id = :id
    """), {"id": inmate_id}).fetchone()

    if last_incident_row and last_incident_row[0]:
        last_date_str = last_incident_row[0]
        if isinstance(last_date_str, str):
            last_date_str = last_date_str[:10]
        try:
            last_date = date.fromisoformat(last_date_str)
            days_since = (today - last_date).days
        except Exception:
            days_since = 9999
    else:
        try:
            sd = date.fromisoformat(start_date) if isinstance(start_date, str) else start_date
            days_since = (today - sd).days
        except Exception:
            days_since = 9999

    disciplinary_days = db.execute(text("""
        SELECT COALESCE(SUM(duration_days), 0) FROM disciplinary_log
        WHERE inmate_id = :id
    """), {"id": inmate_id}).scalar() or 0

    latest_case = db.execute(text("""
        SELECT crime_type, sentence_duration_years, sentence_duration_months, sentence_duration_days
        FROM legal_case
        WHERE inmate_id = :id
        ORDER BY case_number DESC
        LIMIT 1
    """), {"id": inmate_id}).fetchone()

    sentence_type = latest_case[0] if latest_case else "Unknown"
    sentence_duration_months = 0
    if latest_case:
        sentence_duration_months = (latest_case[1] * 12) + latest_case[2] + (latest_case[3] / 30)
        sentence_duration_months = round(sentence_duration_months, 1)

    return {
        "Age": age,
        "Gender": gender,
        "education_level": education_level,
        "Prison_type": prison_type,
        "Prison_security_level": prison_security_level,
        "Incidents_count": incidents_count,
        "Violent_incident_count": violent_count,
        "escape_incident_count": escape_count,
        "days_since_last_incidence": days_since,
        "total_disciplinary_days": disciplinary_days,
        "Sentence Type": sentence_type,
        "Sentence_duration_months": sentence_duration_months,
    }


def predict_inmate_risk(db: SessionDep, inmate_id: int, block_security_level: str = "Unknown") -> dict:
    _load_models()

    features = _get_inmate_features(db, inmate_id)
    features["Block_security_level"] = block_security_level

    risk_level = None
    recidivism_score = None

    if _risk_behavior_model is None:
        print(f"Warning: risk_behavior_model is not loaded, skipping prediction for inmate {inmate_id}")
    else:
        try:
            X = pd.DataFrame([{
                "Age": features["Age"],
                "Gender": features["Gender"],
                "education_level": features["education_level"],
                "Prison_type": features["Prison_type"],
                "Prison_security_level": features["Prison_security_level"],
                "Block_security_level": features["Block_security_level"],
                "Incidents_count": features["Incidents_count"],
                "Violent_incident_count": features["Violent_incident_count"],
                "escape_incident_count": features["escape_incident_count"],
                "days_since_last_incidence": features["days_since_last_incidence"],
                "total_disciplinary_days": features["total_disciplinary_days"],
            }])
            pred = _risk_behavior_model.predict(X)[0]
            risk_level = RISK_LEVEL_MAP.get(int(pred), str(pred))
        except Exception as e:
            print(f"Error predicting risk behavior for inmate {inmate_id}: {e}")
            traceback.print_exc()

    if _recidivism_model is None:
        print(f"Warning: recidivism_model is not loaded, skipping prediction for inmate {inmate_id}")
    else:
        try:
            X = pd.DataFrame([{
                "Age": features["Age"],
                "Gender": features["Gender"],
                "Sentence Type": features["Sentence Type"],
                "education_level": features["education_level"],
                "Sentence_duration_months": features["Sentence_duration_months"],
                "Incident_count": features["Incidents_count"],
                "violent_incidents_count": features["Violent_incident_count"],
                "escape_incidents_count": features["escape_incident_count"],
            }])
            pred = _recidivism_model.predict(X)[0]
            recidivism_score = int(round(max(0, min(100, float(pred)))))
        except Exception as e:
            print(f"Error predicting recidivism for inmate {inmate_id}: {e}")
            traceback.print_exc()

    return {
        "inmate_id": inmate_id,
        "risk_level": risk_level,
        "recidivism": recidivism_score,
    }


def save_inmate_risk(db: SessionDep, inmate_id: int, risk_level: str, recidivism: int | None) -> None:
    existing = db.execute(text("""
        SELECT inmate_id FROM inmates_risk WHERE inmate_id = :id
    """), {"id": inmate_id}).fetchone()

    if existing:
        db.execute(text("""
            UPDATE inmates_risk
            SET risk_level = :risk_level, recidivism = :recidivism
            WHERE inmate_id = :id
        """), {"id": inmate_id, "risk_level": risk_level, "recidivism": recidivism})
    else:
        db.execute(text("""
            INSERT INTO inmates_risk (inmate_id, risk_level, recidivism)
            VALUES (:id, :risk_level, :recidivism)
        """), {"id": inmate_id, "risk_level": risk_level, "recidivism": recidivism})
