from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import select, text
import schemas
import models
from database import SessionDep

router = APIRouter(
    prefix="/prison",
   tags=["prison"]
)

@router.get("", response_model=list[schemas.PrisonResponse], status_code=status.HTTP_200_OK)
def get_all(db: SessionDep):
    prisons = db.execute(text("""
        SELECT *
        FROM prison 
    """)).fetchall()
    
    return prisons

# @router.get("/{id}",status_code=status.HTTP_200_OK,response_model=schemas.ShowBlog)
# def show(id: int, response: Response, db: SessionDep):
#     blog = db.query(models.Blog).filter(models.Blog.id == id).first()
#     if not blog:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Blog with id {id} not found")   
#         # response.status_code = status.HTTP_404_NOT_FOUND
#         # return {"detail": f"Blog with id {id} not found"}
#     return blog

@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.PrisonResponse)
def create_prison(request: schemas.PrisonCreate, db: SessionDep):
    result = db.execute(text("""
        INSERT INTO prison (
            name, type, security_level, location, manager_id,
            has_hospital, has_workshops, has_agricultural_ward, 
            has_visitation_hall, visitation_hall_capacity
        ) VALUES (
            :name, :type, :security_level, :location, :manager_id,
            :has_hospital, :has_workshops, :has_agricultural_ward, 
            :has_visitation_hall, :visitation_hall_capacity
        ) RETURNING *
    """), request.model_dump())
    
    new_prison = result.fetchone()
    db.commit()
    return new_prison