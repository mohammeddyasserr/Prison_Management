"""
Auth Routes — Login / Logout
[NOT IN PRD] — PRD mentions RBAC but doesn't specify login flow.
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse
from compat import Jinja2Templates
from auth import verify_password, get_current_user
from database import get_db

router = APIRouter()
templates = Jinja2Templates(directory="templates")


@router.get("/")
async def root(request: Request):
    user = get_current_user(request)
    if user:
        return RedirectResponse(url="/dashboard", status_code=302)
    return RedirectResponse(url="/login", status_code=302)


@router.get("/login")
async def login_page(request: Request):
    user = get_current_user(request)
    if user:
        return RedirectResponse(url="/dashboard", status_code=302)
    return templates.TemplateResponse("login.html", {"request": request, "error": None})


@router.post("/login")
async def login(request: Request, national_id: str = Form(...), password: str = Form(...)):
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE national_id = ?", (national_id,)).fetchone()
    db.close()

    if not user or not verify_password(password, user["password"]):
        return templates.TemplateResponse("login.html", {
            "request": request,
            "error": "Invalid National ID or password."
        })

    # Store user info in session
    request.session["user_id"] = user["national_id"]
    request.session["role"] = user["role"]
    return RedirectResponse(url="/dashboard", status_code=302)


@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/login", status_code=302)
