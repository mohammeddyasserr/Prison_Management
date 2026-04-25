"""
Auth Routes — Login / Logout
[NOT IN PRD] — PRD mentions RBAC but doesn't specify login flow.
"""
from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse, JSONResponse
from compat import Jinja2Templates
from auth import verify_password, get_current_user
from database import get_db
import json

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
async def login(request: Request):
    # Check if this is a JSON request (from React frontend)
    content_type = request.headers.get("content-type", "")
    is_json_request = "application/json" in content_type

    if is_json_request:
        # Handle JSON login from React frontend
        try:
            body = await request.json()
            identifier = body.get("identifier", "").strip()
            password = body.get("password", "")
        except Exception:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Invalid JSON body"}
            )

        db = get_db()
        # Search by national_id or email
        user = db.execute(
            "SELECT * FROM users WHERE national_id = ? OR email = ?",
            (identifier, identifier)
        ).fetchone()
        db.close()

        if not user or not verify_password(password, user["password"]):
            return JSONResponse(
                status_code=401,
                content={"success": False, "error": "Invalid credentials"}
            )

        # Store user info in session
        request.session["user_id"] = user["national_id"]
        request.session["role"] = user["role"]

        # Map database roles to frontend role names
        role_mapping = {
            "super_admin": "super_admin",
            "prison_manager": "prison_manager",
            "officer": "officer"
        }
        role = role_mapping.get(user["role"], user["role"])

        return JSONResponse(
            content={
                "success": True,
                "role": role,
                "name": user["name"] if user["name"] else user["national_id"],
                "national_id": user["national_id"]
            }
        )
    else:
        # Handle form login from traditional HTML forms
        national_id = await request.form()
        national_id = national_id.get("national_id", "")
        password = national_id.get("password", "") if isinstance(national_id, dict) else ""

        # Re-parse form data properly
        form_data = await request.form()
        national_id = form_data.get("national_id", "")
        password = form_data.get("password", "")

        db = get_db()
        user = db.execute(
            "SELECT * FROM users WHERE national_id = ?",
            (national_id,)
        ).fetchone()
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
