"""
Security & PII masking utilities.

STAFF / TECH roles must never see raw phone numbers or contact details.
Only ADMIN / MANAGER receive plain-text PII.
"""
from __future__ import annotations

import re

from core.config import ROLE_ADMIN, ROLE_MANAGER


# ---------------------------------------------------------------------------
# Masking helpers
# ---------------------------------------------------------------------------

_PHONE_RE = re.compile(r"^(\+?\d{1,3})?[\s\-]?(\d{2,4})[\s\-]?\d+(\d{3})$")


def mask_phone(phone: str) -> str:
    if not phone:
        return ""
    s = phone.strip()
    if len(s) >= 8:
        return s[:3] + "****" + s[-3:]
    return "****"


def mask_contact(contact: str) -> str:
    if not contact:
        return ""
    s = contact.strip()
    if len(s) <= 4:
        return "****"
    return s[:2] + "****" + s[-2:]


# ---------------------------------------------------------------------------
# Role-aware display helpers
# ---------------------------------------------------------------------------

def can_view_pii(role: str) -> bool:
    """Only ADMIN and MANAGER may see unmasked PII."""
    return role.upper() in {ROLE_ADMIN, ROLE_MANAGER}


def display_phone(phone: str, role: str) -> str:
    return phone if can_view_pii(role) else mask_phone(phone)


def display_contact(contact: str, role: str) -> str:
    return contact if can_view_pii(role) else mask_contact(contact)


def apply_member_pii(member_dict: dict, role: str) -> dict:
    """
    Return a copy of `member_dict` with PII masked for non-privileged roles.
    Does NOT mutate the original.
    """
    if can_view_pii(role):
        return dict(member_dict)
    out = dict(member_dict)
    if "phone" in out:
        out["phone"] = mask_phone(str(out.get("phone") or ""))
    if "contact_other" in out:
        out["contact_other"] = mask_contact(str(out.get("contact_other") or ""))
    return out
