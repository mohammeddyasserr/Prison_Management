from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import select, text
import schemas
import models
from database import SessionDep

router = APIRouter(
    prefix="/prison",
   tags=["prison"]
)
