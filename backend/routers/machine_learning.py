from fastapi import APIRouter, HTTPException
from sqlmodel import text

from database import SessionDep
from schemas.ML import InmateRiskResponse, OvercrowdingResponse
from services.overcrowding_predict import (
    predict_and_save_prison_overcrowding,
    predict_and_save_all_prisons_overcrowding,
)
from services.risk_predictor import (
    predict_prison_inmates_risk,
    predict_all_inmates_risk,
)


router = APIRouter(
    prefix="/ML",
    tags=["Machine Learning"],
)


def _current_occupancy_sql() -> str:
    return """
        (
            SELECT COUNT(*)
            FROM inmate i
            JOIN cell c ON i.assigned_cell = c.cell_id
            JOIN block b ON c.block_id = b.block_id
            WHERE b.prison_id = p.prison_id AND i.status != 'Released'
        ) + (
            SELECT COUNT(*)
            FROM pending_inmate pi
            WHERE pi.assigned_prison = p.prison_id AND pi.status != 'Released'
        )
    """


def _total_capacity_sql() -> str:
    return """
        (
            SELECT COALESCE(SUM(c.capacity), 0)
            FROM cell c
            JOIN block b ON c.block_id = b.block_id
            WHERE b.prison_id = p.prison_id
        )
    """


@router.get("/risk", response_model=list[InmateRiskResponse])
def get_inmate_risk_scores(db: SessionDep, prison_id: int | None = None):
    filters = ["COALESCE(i.status, pim.status) != 'Released'"]
    params: dict[str, int] = {}

    if prison_id is not None:
        filters.append("COALESCE(i.assigned_prison, pim.assigned_prison) = :prison_id")
        params["prison_id"] = prison_id

    where_clause = " AND ".join(filters)

    rows = db.execute(
        text(f"""
            SELECT
                ir.inmate_id,
                COALESCE(i.full_name, pim.full_name, 'Unknown') AS full_name,
                COALESCE(ir.risk_level, 'Low') AS risk_level,
                COALESCE(ir.recidivism, 0) AS recidivism,
                COALESCE(i.assigned_prison, pim.assigned_prison) AS prison_id,
                p.name AS prison_name
            FROM inmates_risk ir
            LEFT JOIN inmate i ON i.inmate_id = ir.inmate_id
            LEFT JOIN pending_inmate pim ON pim.pending_inmate_id = ir.inmate_id
            LEFT JOIN prison p ON p.prison_id = COALESCE(i.assigned_prison, pim.assigned_prison)
            WHERE {where_clause}
            ORDER BY COALESCE(ir.recidivism, 0) DESC, full_name ASC
        """),
        params,
    ).mappings().all()

    return [dict(row) for row in rows]


@router.get("/overcrowding", response_model=list[OvercrowdingResponse])
def get_overcrowding_predictions(db: SessionDep, prison_id: int | None = None):
    params: dict[str, int] = {}
    prison_filter = ""

    if prison_id is not None:
        prison_filter = "WHERE p.prison_id = :prison_id"
        params["prison_id"] = prison_id

    rows = db.execute(
        text(f"""
            SELECT
                p.prison_id,
                p.name AS prison_name,
                {_current_occupancy_sql()} AS current_occupancy,
                {_total_capacity_sql()} AS total_capacity,
                COALESCE(o.occupancy_next_30_days, 0) AS occupancy_next_30_days,
                COALESCE(o.occupancy_next_60_days, 0) AS occupancy_next_60_days,
                COALESCE(o.occupancy_next_90_days, 0) AS occupancy_next_90_days
            FROM prison p
            LEFT JOIN overcrowding o ON o.prison_id = p.prison_id
            {prison_filter}
            ORDER BY p.name ASC
        """),
        params,
    ).mappings().all()

    responses = []
    for row in rows:
        current_occupancy = int(row["current_occupancy"] or 0)
        total_capacity = int(row["total_capacity"] or 0)
        next_30 = int(row["occupancy_next_30_days"] or 0)
        next_60 = int(row["occupancy_next_60_days"] or 0)
        next_90 = int(row["occupancy_next_90_days"] or 0)

        current_rate = round((current_occupancy / total_capacity) * 100) if total_capacity else 0
        forecast_rate_30 = round((next_30 / total_capacity) * 100) if total_capacity else 0
        forecast_rate_60 = round((next_60 / total_capacity) * 100) if total_capacity else 0
        forecast_rate_90 = round((next_90 / total_capacity) * 100) if total_capacity else 0

        responses.append(
            OvercrowdingResponse(
                prison_id=row["prison_id"],
                prison_name=row["prison_name"],
                current_occupancy=current_occupancy,
                total_capacity=total_capacity,
                current_rate=current_rate,
                occupancy_next_30_days=next_30,
                occupancy_next_60_days=next_60,
                occupancy_next_90_days=next_90,
                forecast_rate_30=forecast_rate_30,
                forecast_rate_60=forecast_rate_60,
                forecast_rate_90=forecast_rate_90,
            )
        )

    return responses


# ---------------------------------------------------------------------------
# Refresh / re-run ML predictions
# ---------------------------------------------------------------------------

@router.post("/machine_learning_refresh/{prison_id}")
def refresh_for_prison(prison_id: int, db: SessionDep):
    """Re-run both the overcrowding and inmate-risk ML models for a single prison."""
    errors = []

    overcrowding_result = None
    try:
        overcrowding_result = predict_and_save_prison_overcrowding(db, prison_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        errors.append(f"Overcrowding: {e}")

    risk_results = None
    try:
        risk_results = predict_prison_inmates_risk(db, prison_id)
    except Exception as e:
        errors.append(f"Risk: {e}")

    return {
        "overcrowding": overcrowding_result,
        "risk_predictions": risk_results,
        "errors": errors if errors else None,
    }


@router.post("/machine_learning_refresh")
def refresh_for_all_prisons(db: SessionDep):
    """Re-run both the overcrowding and inmate-risk ML models for every prison."""
    errors = []

    overcrowding_results = None
    try:
        overcrowding_results = predict_and_save_all_prisons_overcrowding(db)
    except Exception as e:
        errors.append(f"Overcrowding: {e}")

    risk_results = None
    try:
        risk_results = predict_all_inmates_risk(db)
    except Exception as e:
        errors.append(f"Risk: {e}")

    return {
        "overcrowding": overcrowding_results,
        "risk_predictions": risk_results,
        "errors": errors if errors else None,
    }

    
