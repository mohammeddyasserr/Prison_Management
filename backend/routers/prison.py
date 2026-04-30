from fastapi import APIRouter, Depends, status, HTTPException
from .. import schemas, models
from ..database import SessionDep


# @router.get("/{id}",status_code=status.HTTP_200_OK,response_model=schemas.ShowBlog)
# def show(id: int, response: Response, db: SessionDep):
#     blog = db.query(models.Blog).filter(models.Blog.id == id).first()
#     if not blog:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Blog with id {id} not found")   
#         # response.status_code = status.HTTP_404_NOT_FOUND
#         # return {"detail": f"Blog with id {id} not found"}
#     return blog