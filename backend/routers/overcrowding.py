import sys
import os
import pandas as pd
import numpy as np
import joblib
from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import select, text
import schemas
from schemas.ML import overcrowding_response
from database import SessionDep
from typing import List
from datetime import datetime, date, timedelta
import statistics
from sklearn.base import BaseEstimator, TransformerMixin

# Define the custom Transformer to match the one used during training
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

# Patch __main__ so joblib can unpickle the class properly
import __main__
setattr(__main__, "FeatureEngineering", FeatureEngineering)

# Pre-load the model
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "ai_service", "models", "overcrowding.pkl")
try:
    overcrowding_model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Warning: Could not load overcrowding model: {e}")
    overcrowding_model = None

router = APIRouter(
    prefix="/ML/overcrowding",
    tags=["Machine Learning"]
)

def add_duration(start_date: date, years: int, months: int, days: int) -> date:
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

def calculate_prison_features(prison_id: int, db: SessionDep) -> dict:
    prison_row = db.execute(text("SELECT type, security_level FROM prison WHERE prison_id = :pid"), {"pid": prison_id}).fetchone()
    if not prison_row:
        raise HTTPException(status_code=404, detail="Prison not found")
        
    prison_type, security_level = prison_row

    cap_row = db.execute(text("""
        SELECT COUNT(DISTINCT b.block_id), COALESCE(SUM(c.capacity), 0)
        FROM block b LEFT JOIN cell c ON b.block_id = c.block_id
        WHERE b.prison_id = :pid
    """), {"pid": prison_id}).fetchone()
    num_blocks, capacity = cap_row if cap_row else (0, 0)

    pending_adm = db.execute(text("SELECT COUNT(*) FROM pending_inmate WHERE assigned_prison = :pid"), {"pid": prison_id}).scalar() or 0
    
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

    inmates_query = """
        SELECT i.inmate_id, i.start_date, i.status
        FROM inmate i
        WHERE i.assigned_prison = :pid
    """
    inmates_rows = db.execute(text(inmates_query), {"pid": prison_id}).fetchall()
    
    cases_query = """
        SELECT inmate_id, sentence_duration_years, sentence_duration_months, sentence_duration_days
        FROM legal_case
    """
    cases_rows = db.execute(text(cases_query)).fetchall()
    
    inmate_durations = {}
    for row in cases_rows:
        iid, y, m, d = row
        if iid not in inmate_durations:
            inmate_durations[iid] = {'y': 0, 'm': 0, 'd': 0}
        inmate_durations[iid]['y'] += y
        inmate_durations[iid]['m'] += m
        inmate_durations[iid]['d'] += d

    today = date.today()
    
    current_occupancy = 0
    adm_7 = 0
    adm_30 = 0
    rel_last_7 = 0
    rel_last_30 = 0
    upc_rel_30 = 0
    upc_rel_60 = 0
    upc_rel_90 = 0
    
    rem_sentences = []
    
    occ_7_ago = 0
    occ_30_ago = 0
    occ_60_ago = 0
    occ_90_ago = 0

    date_7_ago = today - timedelta(days=7)
    date_30_ago = today - timedelta(days=30)
    date_60_ago = today - timedelta(days=60)
    date_90_ago = today - timedelta(days=90)
    
    for row in inmates_rows:
        iid, start_date_str, status = row
        try:
            start_date = datetime.strptime(start_date_str[:10], "%Y-%m-%d").date()
        except Exception:
            continue
            
        dur = inmate_durations.get(iid, {'y': 0, 'm': 0, 'd': 0})
        release_date = add_duration(start_date, dur['y'], dur['m'], dur['d'])
        
        if status == 'Active':
            current_occupancy += 1
            
            if start_date >= date_7_ago: adm_7 += 1
            if start_date >= date_30_ago: adm_30 += 1
            
            rem_days = (release_date - today).days
            if rem_days > 0:
                rem_sentences.append(rem_days / 365.25)
            else:
                rem_sentences.append(0)
                
            if 0 <= rem_days <= 30: upc_rel_30 += 1
            if 0 <= rem_days <= 60: upc_rel_60 += 1
            if 0 <= rem_days <= 90: upc_rel_90 += 1
            
        else:
            days_since_release = (today - release_date).days
            if 0 <= days_since_release <= 7: rel_last_7 += 1
            if 0 <= days_since_release <= 30: rel_last_30 += 1
            
        if start_date <= date_7_ago and release_date > date_7_ago: occ_7_ago += 1
        if start_date <= date_30_ago and release_date > date_30_ago: occ_30_ago += 1
        if start_date <= date_60_ago and release_date > date_60_ago: occ_60_ago += 1
        if start_date <= date_90_ago and release_date > date_90_ago: occ_90_ago += 1

    avg_rem = sum(rem_sentences) / len(rem_sentences) if rem_sentences else 0.0
    med_rem = statistics.median(rem_sentences) if rem_sentences else 0.0

    return {
        "Prison_Type": prison_type,
        "Security_Level": security_level,
        "Capacity": capacity,
        "Number_of_Blocks": num_blocks,
        "Current_Occupancy": current_occupancy,
        "Admissions_Last_7_Days": adm_7,
        "Admissions_Last_30_Days": adm_30,
        "Pending_Admissions": pending_adm,
        "Releases_Last_7_Days": rel_last_7,
        "Releases_Last_30_Days": rel_last_30,
        "Upcoming_Releases_30_Days": upc_rel_30,
        "Upcoming_Releases_60_Days": upc_rel_60,
        "Upcoming_Releases_90_Days": upc_rel_90,
        "Transfers_In_Last_30_Days": transfers_in_30,
        "Transfers_Out_Last_30_Days": transfers_out_30,
        "Pending_Transfers_In": pending_trans_in,
        "Pending_Transfers_Out": pending_trans_out,
        "Average_Remaining_Sentence": round(avg_rem, 2),
        "Median_Remaining_Sentence": round(med_rem, 2),
        "Occupancy_7_Days_Ago": occ_7_ago,
        "Occupancy_30_Days_Ago": occ_30_ago,
        "Occupancy_60_Days_Ago": occ_60_ago,
        "Occupancy_90_Days_Ago": occ_90_ago
    }

@router.get("/{prison_id}", response_model=overcrowding_response)
def get_overcrowding_prediction(prison_id: int, db: SessionDep):
    if overcrowding_model is None:
        raise HTTPException(status_code=500, detail="Machine Learning model could not be loaded")
        
    features = calculate_prison_features(prison_id, db)
    df = pd.DataFrame([features])
    
    preds = overcrowding_model.predict(df)[0]
    
    return overcrowding_response(
        prison_id=prison_id,
        occupancy_after_30_Days=max(0, int(round(preds[0]))),
        occupancy_after_60_Days=max(0, int(round(preds[1]))),
        occupancy_after_90_Days=max(0, int(round(preds[2])))
    )
