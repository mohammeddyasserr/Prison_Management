"""
auth.py — Authentication & RBAC helpers for CPMS
PRD Section 3: Role-Based Access Control

Uses Python's built-in hashlib for password hashing (no external libraries).
"""
import hashlib
import os
from functools import wraps
from fastapi import Request, HTTPException
from fastapi.responses import RedirectResponse
from database import get_db


def hash_password(password: str) -> str:
    """Hash a password with a random salt using SHA-256."""
    salt = os.urandom(16).hex()
    hashed = hashlib.sha256((salt + password).encode()).hexdigest()
    return salt + ":" + hashed


def verify_password(password: str, stored: str) -> bool:
    """Verify a password against the stored salt:hash."""
    if ":" not in stored:
        return False
    salt, hashed = stored.split(":", 1)
    return hashlib.sha256((salt + password).encode()).hexdigest() == hashed


def get_current_user(request: Request):
    """
    Get the currently logged-in user from the session.
    Returns a dict with user info, or None if not logged in.
    """
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE national_id = ?", (user_id,)).fetchone()
    db.close()
    if user:
        return dict(user)
    return None


def require_login(request: Request):
    """Check if the user is logged in. Returns the user or redirects to login."""
    user = get_current_user(request)
    if not user:
        return None
    return user


def check_role(user, *allowed_roles):
    """Check if the user has one of the allowed roles. Returns True/False."""
    if not user:
        return False
    return user["role"] in allowed_roles
