"""
Technician photo/video uploads — max 10 files per technician.
Files live under uploads/technicians/{tech_id}/...
"""
from __future__ import annotations

import mimetypes
import uuid
from pathlib import Path
from typing import Any

from core.config import TECH_UPLOAD_DIR
from core.database import DB

MAX_TECH_MEDIA = 10

_IMAGE = frozenset({"image/jpeg", "image/png", "image/gif", "image/webp"})
_VIDEO = frozenset({"video/mp4", "video/webm", "video/quicktime"})


def abs_path(relative_path: str) -> Path:
    return TECH_UPLOAD_DIR / relative_path


def count_tech_media(database: DB, technician_id: int) -> int:
    row = database.one(
        "SELECT COUNT(*) AS c FROM technician_media WHERE technician_id=?",
        (technician_id,),
    )
    return int(row["c"]) if row else 0


def list_tech_media(database: DB, technician_id: int) -> list[dict[str, Any]]:
    return database.all(
        """
        SELECT id, technician_id, relative_path, mime_type, kind, sort_order, created_at
        FROM technician_media
        WHERE technician_id = ?
        ORDER BY sort_order ASC, id ASC
        """,
        (technician_id,),
    )


def _guess_kind(mime: str | None, name: str) -> str | None:
    if mime:
        if mime in _IMAGE:
            return "image"
        if mime in _VIDEO:
            return "video"
    low = name.lower()
    if low.endswith((".jpg", ".jpeg", ".png", ".gif", ".webp")):
        return "image"
    if low.endswith((".mp4", ".webm", ".mov")):
        return "video"
    return None


def save_uploaded_media(
    database: DB,
    technician_id: int,
    uploaded_files: list[Any],
) -> tuple[int, str | None]:
    """
    Persist UploadedFile objects. Returns (saved_count, error_message).
    """
    if not uploaded_files:
        return 0, None
    current = count_tech_media(database, technician_id)
    if current >= MAX_TECH_MEDIA:
        return 0, "max_media"
    room = MAX_TECH_MEDIA - current
    to_save = uploaded_files[:room]
    if len(uploaded_files) > room:
        # partial save — still error hint
        pass

    tech_dir = TECH_UPLOAD_DIR / str(technician_id)
    tech_dir.mkdir(parents=True, exist_ok=True)

    saved = 0
    sort_base = current
    for i, uf in enumerate(to_save):
        mime = getattr(uf, "type", None) or mimetypes.guess_type(uf.name)[0]
        kind = _guess_kind(mime, uf.name)
        if not kind:
            continue
        ext = Path(uf.name).suffix or (".jpg" if kind == "image" else ".mp4")
        if ext.lower() not in (
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm", ".mov",
        ):
            ext = ".jpg" if kind == "image" else ".mp4"
        fname = f"{uuid.uuid4().hex[:16]}{ext}"
        rel = f"{technician_id}/{fname}"
        dest = tech_dir / fname
        data = uf.getvalue()
        dest.write_bytes(data)
        database.execute_insert(
            """
            INSERT INTO technician_media
            (technician_id, relative_path, mime_type, kind, sort_order)
            VALUES (?,?,?,?,?)
            """,
            (technician_id, rel, mime or "", kind, sort_base + i),
        )
        saved += 1

    sync_primary_photo(database, technician_id)
    if len(uploaded_files) > room and saved > 0:
        return saved, "partial_max"
    if len(uploaded_files) > 0 and saved == 0:
        return 0, "no_valid_files"
    return saved, None


def delete_media_row(database: DB, media_id: int, technician_id: int) -> bool:
    row = database.one(
        "SELECT id, relative_path FROM technician_media WHERE id=? AND technician_id=?",
        (media_id, technician_id),
    )
    if not row:
        return False
    p = abs_path(row["relative_path"])
    try:
        if p.exists():
            p.unlink()
    except OSError:
        pass
    database.execute(
        "DELETE FROM technician_media WHERE id=? AND technician_id=?",
        (media_id, technician_id),
    )
    sync_primary_photo(database, technician_id)
    return True


def sync_primary_photo(database: DB, technician_id: int) -> None:
    """Set technicians.photo_path to first image file for display wall."""
    rows = list_tech_media(database, technician_id)
    for r in rows:
        if r["kind"] == "image":
            p = abs_path(r["relative_path"])
            database.execute(
                "UPDATE technicians SET photo_path=? WHERE id=?",
                (str(p), technician_id),
            )
            return
    database.execute(
        "UPDATE technicians SET photo_path=NULL WHERE id=?",
        (technician_id,),
    )
