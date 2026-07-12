from fastapi import APIRouter, HTTPException
from database import SessionDep
from typing import List
from services.overcrowding_predict import (
    predict_and_save_prison_overcrowding,
    predict_and_save_all_prisons_overcrowding,
)

router = APIRouter(
    prefix="/ML/predict",
    tags=["Machine Learning"]
)


@router.post("/overcrowding/{prison_id}")
def get_overcrowding_prediction(prison_id: int, db: SessionDep):
    try:
        return predict_and_save_prison_overcrowding(db, prison_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/overcrowding", response_model=List[dict])
def get_all_overcrowding_predictions(db: SessionDep):
    try:
        return predict_and_save_all_prisons_overcrowding(db)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))