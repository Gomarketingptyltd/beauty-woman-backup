"""
Authentication & RBAC  —  V1.4

Roles: ADMIN > MANAGER > STAFF > TECH
- ADMIN / MANAGER : can void orders
- STAFF           : operational (open orders, topup, etc.)
- TECH            : own queue + commission only
"""
from __future__ import annotations

import hashlib
import hmac
import os
from dataclasses import dataclass
from typing import Optional

import streamlit as st

from core.config import (
    ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF, ROLE_TECH,
    ROLES_CAN_VOID, ROLES_OPERATIONAL,
)
from core.database import DB, db as _default_db

try:
    import bcrypt as _bcrypt  # type: ignore
    _BCRYPT = True
except Exception:
    _bcrypt = None  # type: ignore
    _BCRYPT = False


# ---------------------------------------------------------------------------
# Password utilities
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    if _BCRYPT:
        return _bcrypt.hashpw(password.encode(), _bcrypt.gensalt(12)).decode()
    # PBKDF2 fallback (no external deps)
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"pbkdf2${salt.hex()}${dk.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        if stored_hash.startswith("pbkdf2$"):
            _, salt_hex, dk_hex = stored_hash.split("$", 2)
            salt = bytes.fromhex(salt_hex)
            expected = bytes.fromhex(dk_hex)
            dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
            return hmac.compare_digest(dk, expected)
        if _BCRYPT:
            # Also handle bcrypt hashes even if stored as pbkdf2 during migration
            return _bcrypt.checkpw(password.encode(), stored_hash.encode())
        return False
    except Exception:
        return False


# ---------------------------------------------------------------------------
# User dataclass
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class User:
    id: int
    username: str
    role: str
    display_name: str
    phone: str
    contact_other: str

    @property
    def can_void(self) -> bool:
        return self.role in ROLES_CAN_VOID

    @property
    def can_operate(self) -> bool:
        return self.role in ROLES_OPERATIONAL

    @property
    def is_tech(self) -> bool:
        return self.role == ROLE_TECH

    @property
    def role_label_zh(self) -> str:
        return {
            ROLE_ADMIN: "管理员",
            ROLE_MANAGER: "店长",
            ROLE_STAFF: "前台",
            ROLE_TECH: "技师",
        }.get(self.role, self.role)


def _row_to_user(row) -> User:
    return User(
        id=int(row["id"]),
        username=str(row["username"]),
        role=str(row["role"]),
        display_name=str(row["display_name"] or row["username"]),
        phone=str(row["phone"] or ""),
        contact_other=str(row["contact_other"] or ""),
    )


# ---------------------------------------------------------------------------
# Bootstrap default users (first-run)
# ---------------------------------------------------------------------------

DEFAULT_USERS = [
    ("admin",   "Ocean888", ROLE_ADMIN,   "管理员"),
    ("manager", "Mgr888",   ROLE_MANAGER, "店长"),
    ("staff",   "Staff888", ROLE_STAFF,   "前台"),
]


def ensure_default_users(database: DB | None = None) -> None:
    d = database or _default_db
    count = d.one("SELECT COUNT(*) AS c FROM users")
    if count and int(count["c"]) > 0:
        return
    for username, password, role, display_name in DEFAULT_USERS:
        d.execute(
            "INSERT INTO users (username, password_hash, role, display_name) VALUES (?,?,?,?)",
            (username, hash_password(password), role, display_name),
        )


# ---------------------------------------------------------------------------
# Login / logout / session
# ---------------------------------------------------------------------------

def login(username: str, password: str, database: DB | None = None) -> bool:
    d = database or _default_db
    row = d.one("SELECT * FROM users WHERE username=? AND is_active=1", (username.strip(),))
    if not row:
        return False
    stored = str(row["password_hash"])
    if not verify_password(password, stored):
        _try_migrate_hash(d, row, password, stored)
        return False
    st.session_state["_user"] = _row_to_user(row).__dict__
    return True


def _try_migrate_hash(d: DB, row, password: str, stored: str) -> None:
    """
    If bcrypt unavailable and stored is bcrypt hash,
    only migrate if this is a known default password (bootstrap safety).
    """
    if _BCRYPT:
        return
    is_bcrypt = stored.startswith(("$2a$", "$2b$", "$2y$"))
    if not is_bcrypt:
        return
    defaults = {u[0]: u[1] for u in DEFAULT_USERS}
    uname = str(row["username"])
    if uname in defaults and password == defaults[uname]:
        new_hash = hash_password(password)
        d.execute("UPDATE users SET password_hash=? WHERE id=?", (new_hash, int(row["id"])))


def logout() -> None:
    st.session_state.pop("_user", None)


def current_user() -> Optional[User]:
    data = st.session_state.get("_user")
    if not data:
        return None
    try:
        return User(**{k: data[k] for k in User.__dataclass_fields__})
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Guards (call at top of every restricted page)
# ---------------------------------------------------------------------------

def require_login() -> User:
    u = current_user()
    if u is None:
        # 未登录直接回首页登录，避免子页面只显示一行提示（如直接打开 /Reception）
        st.switch_page("Home.py")
        st.stop()
    return u


def require_role(*roles: str) -> User:
    u = require_login()
    if u.role not in {r.upper() for r in roles}:
        st.error(f"权限不足（需要 {', '.join(roles)} 角色）")
        st.stop()
    return u


def require_operational() -> User:
    """Allow ADMIN, MANAGER, STAFF."""
    return require_role(ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF)


def require_void_permission() -> User:
    """Allow ADMIN, MANAGER only."""
    return require_role(ROLE_ADMIN, ROLE_MANAGER)
