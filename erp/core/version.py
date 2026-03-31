"""
Release version — read from the `VERSION` file at the app root (ON-VMS-2.0/VERSION).
"""
from __future__ import annotations

from pathlib import Path

_APP_ROOT = Path(__file__).resolve().parents[1]
_VERSION_FILE = _APP_ROOT / "VERSION"


def read_version() -> str:
    if _VERSION_FILE.is_file():
        return _VERSION_FILE.read_text(encoding="utf-8").strip() or "0.0.0"
    return "0.0.0"


APP_VERSION: str = read_version()
