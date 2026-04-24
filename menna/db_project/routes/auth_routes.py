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


def find_user_by_login_identifier(identifier: str):
    normalized = (identifier or "").strip()
    if not normalized:
        return None

    db = get_db()
    user = db.execute(
        """
        SELECT * FROM users
        WHERE lower(trim(national_id)) = lower(?)
           OR lower(trim(email)) = lower(?)
           OR lower(trim(name)) = lower(?)
        LIMIT 1
        """,
        (normalized, normalized, normalized),
    ).fetchone()
    db.close()
    return user


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
    user = find_user_by_login_identifier(national_id)

    if not user or not verify_password(password, user["password"]):
        return templates.TemplateResponse("login.html", {
            "request": request,
            "error": "Invalid username, email, National ID, or password."
        })

    # Store user info in session
    request.session["user_id"] = user["national_id"]
    request.session["role"] = user["role"]
    return RedirectResponse(url="/dashboard", status_code=302)


@router.post("/api/login")
async def api_login(request: Request):
    data = await request.json()
    identifier = data.get("identifier") or data.get("national_id") or data.get("username")
    password = data.get("password", "")
    user = find_user_by_login_identifier(identifier)

    if not user or not verify_password(password, user["password"]):
        return {"success": False, "error": "Invalid username, email, National ID, or password"}

    request.session["user_id"] = user["national_id"]
    request.session["role"] = user["role"]

    return {
        "success": True,
        "role": user["role"],
        "name": user["name"],
        "national_id": user["national_id"],
        "prison_id": user["prison_id"]
    }


@router.post("/api/logout")
async def api_logout(request: Request):
    request.session.clear()
    return {"success": True}


@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/login", status_code=302)
