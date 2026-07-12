import os
import joblib
import traceback
import statistics
import numpy as np
import pandas as pd
from datetime import datetime, date, timedelta
from sklearn.base import BaseEstimator, TransformerMixin
from sqlmodel import text
from database import SessionDep

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------

# services/ -> backend/ -> project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "ai_service", "models", "overcrowding.pkl")

# ---------------------------------------------------------------------------
# Custom transformer – must match the one used during training so that
# joblib can unpickle the pipeline correctly.
# ---------------------------------------------------------------------------

class FeatureEngineering(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        capacity = X["Capacity"].replace(0, np.nan)
        occupancy_30 = X["Occupancy_30_Days_Ago"].replace(0, np.nan)
        X["Current_Occupancy_Rate"] = (X["Current_Occupancy"] / capacity) * 100
        X["Average_Daily_Admissions"] = (X["Admissions_Last_30_Days"] / 30)
        X["Monthly_Growth_Rate"] = ((X["Current_Occupancy"] - occupancy_30) / occupancy_30) * 100
        X = X.replace([np.inf, -np.inf], np.nan)
        X = X.fillna(0)
        return X


# Patch __main__ so joblib can unpickle the custom transformer properly
import __main__
setattr(__main__, "FeatureEngineering", FeatureEngineering)

_overcrowding_model = None
_model_loaded = False


def _load_model():
    global _overcrowding_model, _model_loaded
    if _model_loaded:
        return

    print(f"Loading overcrowding model from: {MODEL_PATH}")
    print(f"Model file exists: {os.path.exists(MODEL_PATH)}")

    try:
        _overcrowding_model = joblib.load(MODEL_PATH)
        print("Overcrowding model loaded successfully")
    except Exception as e:
        print(f"Failed to load overcrowding model: {e}")
        traceback.print_exc()

    _model_loaded = True
    print(f"Model loaded: {_overcrowding_model is not None}")


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _add_duration(start_date: date, years: int, months: int, days: int) -> date:
    """Add years/months/days to a date, handling month-end overflow safely."""
    y = start_date.year + years
    m = start_date.month + months
    while m > 12:
        y += 1
        m -= 12
    import calendar
    try:
        _, max_days = calendar.monthrange(y, m)
        d = min(start_date.day, max_days)
        new_date = date(y, m, d)
    except ValueError:
        new_date = date(y, m, 1)
    return new_date + timedelta(days=days)


# ---------------------------------------------------------------------------
# Feature engineering
# ---------------------------------------------------------------------------

def _calculate_prison_features(prison_id: int, db: SessionDep) -> dict:
    """Gather all raw features required by the overcrowding model for one prison."""

    prison_row = db.execute(
        text("SELECT type, security_level FROM prison WHERE prison_id = :pid"),
        {"pid": prison_id},
    ).fetchone()
    if not prison_row:
        raise ValueError(f"Prison {prison_id} not found")

    prison_type, security_level = prison_row

    cap_row = db.execute(text("""
        SELECT COUNT(DISTINCT b.block_id), COALESCE(SUM(c.capacity), 0)
        FROM block b LEFT JOIN cell c ON b.block_id = c.block_id
        WHERE b.prison_id = :pid
    """), {"pid": prison_id}).fetchone()
    num_blocks, capacity = cap_row if cap_row else (0, 0)

    pending_adm = db.execute(
        text("SELECT COUNT(*) FROM pending_inmate WHERE assigned_prison = :pid"),
        {"pid": prison_id},
    ).scalar() or 0

    transfers_in_30 = db.execute(text("""
        SELECT COUNT(*) FROM transfer
        WHERE destination_prison = :pid AND status = 'Approved' AND approval_date >= date('now', '-30 days')
    """), {"pid": prison_id}).scalar() or 0

    transfers_out_30 = db.execute(text("""
        SELECT COUNT(*) FROM transfer
        WHERE requesting_prison = :pid AND status = 'Approved' AND approval_date >= date('now', '-30 days')
    """), {"pid": prison_id}).scalar() or 0

    pending_trans_in = db.execute(text("""
        SELECT COUNT(*) FROM transfer WHERE destination_prison = :pid AND status = 'Pending'
    """), {"pid": prison_id}).scalar() or 0

    pending_trans_out = db.execute(text("""
        SELECT COUNT(*) FROM transfer WHERE requesting_prison = :pid AND status = 'Pending'
    """), {"pid": prison_id}).scalar() or 0

    inmates_rows = db.execute(text("""
        SELECT i.inmate_id, i.start_date, i.status
        FROM inmate i
        WHERE i.assigned_prison = :pid
    """), {"pid": prison_id}).fetchall()

    cases_rows = db.execute(text("""
        SELECT inmate_id, sentence_duration_years, sentence_duration_months, sentence_duration_days
        FROM legal_case
    """)).fetchall()

    inmate_durations: dict = {}
    for row in cases_rows:
        iid, y, m, d = row
        if iid not in inmate_durations:
            inmate_durations[iid] = {"y": 0, "m": 0, "d": 0}
        inmate_durations[iid]["y"] += y
        inmate_durations[iid]["m"] += m
        inmate_durations[iid]["d"] += d

    today = date.today()
    date_7_ago  = today - timedelta(days=7)
    date_30_ago = today - timedelta(days=30)
    date_60_ago = today - timedelta(days=60)
    date_90_ago = today - timedelta(days=90)

    current_occupancy = adm_7 = adm_30 = 0
    rel_last_7 = rel_last_30 = 0
    upc_rel_30 = upc_rel_60 = upc_rel_90 = 0
    occ_7_ago = occ_30_ago = occ_60_ago = occ_90_ago = 0
    rem_sentences: list = []

    for row in inmates_rows:
        iid, start_date_str, status = row
        try:
            start_date = datetime.strptime(start_date_str[:10], "%Y-%m-%d").date()
        except Exception:
            continue

        dur = inmate_durations.get(iid, {"y": 0, "m": 0, "d": 0})
        release_date = _add_duration(start_date, dur["y"], dur["m"], dur["d"])

        if status == "Active":
            current_occupancy += 1
            if start_date >= date_7_ago:  adm_7  += 1
            if start_date >= date_30_ago: adm_30 += 1

            rem_days = (release_date - today).days
            rem_sentences.append(max(0, rem_days) / 365.25)

            if 0 <= rem_days <= 30: upc_rel_30 += 1
            if 0 <= rem_days <= 60: upc_rel_60 += 1
            if 0 <= rem_days <= 90: upc_rel_90 += 1
        else:
            days_since_release = (today - release_date).days
            if 0 <= days_since_release <= 7:  rel_last_7  += 1
            if 0 <= days_since_release <= 30: rel_last_30 += 1

        if start_date <= date_7_ago  and release_date > date_7_ago:  occ_7_ago  += 1
        if start_date <= date_30_ago and release_date > date_30_ago: occ_30_ago += 1
        if start_date <= date_60_ago and release_date > date_60_ago: occ_60_ago += 1
        if start_date <= date_90_ago and release_date > date_90_ago: occ_90_ago += 1

    avg_rem = sum(rem_sentences) / len(rem_sentences) if rem_sentences else 0.0
    med_rem = statistics.median(rem_sentences) if rem_sentences else 0.0

    return {
        "Prison_Type":                  prison_type,
        "Security_Level":               security_level,
        "Capacity":                     capacity,
        "Number_of_Blocks":             num_blocks,
        "Current_Occupancy":            current_occupancy,
        "Admissions_Last_7_Days":       adm_7,
        "Admissions_Last_30_Days":      adm_30,
        "Pending_Admissions":           pending_adm,
        "Releases_Last_7_Days":         rel_last_7,
        "Releases_Last_30_Days":        rel_last_30,
        "Upcoming_Releases_30_Days":    upc_rel_30,
        "Upcoming_Releases_60_Days":    upc_rel_60,
        "Upcoming_Releases_90_Days":    upc_rel_90,
        "Transfers_In_Last_30_Days":    transfers_in_30,
        "Transfers_Out_Last_30_Days":   transfers_out_30,
        "Pending_Transfers_In":         pending_trans_in,
        "Pending_Transfers_Out":        pending_trans_out,
        "Average_Remaining_Sentence":   round(avg_rem, 2),
        "Median_Remaining_Sentence":    round(med_rem, 2),
        "Occupancy_7_Days_Ago":         occ_7_ago,
        "Occupancy_30_Days_Ago":        occ_30_ago,
        "Occupancy_60_Days_Ago":        occ_60_ago,
        "Occupancy_90_Days_Ago":        occ_90_ago,
    }


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------

def _save_overcrowding_prediction(
    db: SessionDep,
    prison_id: int,
    pred_30: int,
    pred_60: int,
    pred_90: int,
) -> None:
    """Upsert the overcrowding prediction row for a prison."""
    existing = db.execute(
        text("SELECT 1 FROM overcrowding WHERE prison_id = :pid LIMIT 1"),
        {"pid": prison_id},
    ).fetchone()

    values = {
        "pid": prison_id,
        "p30": pred_30,
        "p60": pred_60,
        "p90": pred_90,
    }

    if existing:
        db.execute(text("""
            UPDATE overcrowding
            SET occupancy_next_30_days = :p30,
                occupancy_next_60_days = :p60,
                occupancy_next_90_days = :p90
            WHERE prison_id = :pid
        """), values)
    else:
        db.execute(text("""
            INSERT INTO overcrowding (
                prison_id,
                occupancy_next_30_days,
                occupancy_next_60_days,
                occupancy_next_90_days
            ) VALUES (
                :pid,
                :p30,
                :p60,
                :p90
            )
        """), values)

    db.commit()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def predict_and_save_prison_overcrowding(db: SessionDep, prison_id: int) -> dict:
    """
    Predict overcrowding for a single prison and persist the result.

    Returns a dict with:
        prison_id, capacity, current_occupancy,
        occupancy_after_30_days, occupancy_after_60_days, occupancy_after_90_days

    Raises:
        RuntimeError  – if the model could not be loaded.
        ValueError    – if the prison_id does not exist in the database.
    """
    _load_model()

    if _overcrowding_model is None:
        raise RuntimeError("Overcrowding model could not be loaded")

    features = _calculate_prison_features(prison_id, db)
    df = pd.DataFrame([features])
    preds = _overcrowding_model.predict(df)[0]

    pred_30 = max(0, int(round(preds[0])))
    pred_60 = max(0, int(round(preds[1])))
    pred_90 = max(0, int(round(preds[2])))

    _save_overcrowding_prediction(db, prison_id, pred_30, pred_60, pred_90)

    return {
        "prison_id":                prison_id,
        "capacity":                 features["Capacity"],
        "current_occupancy":        features["Current_Occupancy"],
        "occupancy_after_30_days":  pred_30,
        "occupancy_after_60_days":  pred_60,
        "occupancy_after_90_days":  pred_90,
    }


def predict_and_save_all_prisons_overcrowding(db: SessionDep) -> list[dict]:
    """
    Predict overcrowding for every prison in the database and persist each result.

    Failures for individual prisons are logged and skipped so that the rest
    of the prisons are still processed.

    Returns a list of result dicts (same shape as predict_and_save_prison_overcrowding).

    Raises:
        RuntimeError – if the model could not be loaded.
    """
    _load_model()

    if _overcrowding_model is None:
        raise RuntimeError("Overcrowding model could not be loaded")

    prison_rows = db.execute(text("SELECT prison_id FROM prison")).fetchall()
    results: list[dict] = []

    for (pid,) in prison_rows:
        try:
            result = predict_and_save_prison_overcrowding(db, pid)
            results.append(result)
        except Exception as e:
            print(f"Error predicting overcrowding for prison {pid}: {e}")
            traceback.print_exc()
            continue

    return results
