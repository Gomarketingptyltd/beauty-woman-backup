"""
Merge images under assets/ into one folder.

Usage:
  python merge_assets_images.py
  python merge_assets_images.py --portraits-only
  python merge_assets_images.py --dest assets/my_flat_folder

--portraits-only: only files under a ``person_*`` folder (e.g. person_012); skips
  ``unknown`` and common junk (logo, placeholder, favicon).
"""
from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path

ASSETS = Path(__file__).resolve().parent / "assets"
SKIP_DIRS = {"styles", "merged_flat", "merged_portraits_only"}
IMG_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}

_PERSON_DIR = re.compile(r"^person_\d+$", re.IGNORECASE)
_JUNK_NAMES = frozenset(
    {
        "logo.jpg",
        "logo.png",
        "logo.webp",
        "placeholder.png",
        "placeholder.jpg",
        "favicon.ico",
        ".gitkeep",
    }
)


def _under_person_cluster(path: Path, assets_root: Path) -> bool:
    """True if file path contains a person_<digits> directory segment."""
    try:
        rel = path.relative_to(assets_root)
    except ValueError:
        return False
    return any(_PERSON_DIR.match(part) for part in rel.parts)


def _is_junk_file(path: Path) -> bool:
    name = path.name.lower()
    if name in _JUNK_NAMES:
        return True
    if name.startswith("logo.") and path.suffix.lower() in IMG_EXT:
        return True
    if name.startswith("placeholder.") and path.suffix.lower() in IMG_EXT:
        return True
    return False


def _path_has_unknown(path: Path, assets_root: Path) -> bool:
    try:
        rel = path.relative_to(assets_root)
    except ValueError:
        return False
    return any(part.lower() == "unknown" for part in rel.parts)


def _safe_name(rel: Path) -> str:
    parts = [p for p in rel.parts if p]
    return "__".join(parts).replace(" ", "_")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--dest",
        type=Path,
        default=None,
        help="Destination folder (created if missing)",
    )
    ap.add_argument(
        "--portraits-only",
        action="store_true",
        help="Only images under person_* folders; exclude unknown/ and junk files",
    )
    args = ap.parse_args()
    portraits_only: bool = args.portraits_only
    if args.dest is None:
        dest = ASSETS / (
            "merged_portraits_only" if portraits_only else "merged_flat"
        )
    else:
        dest = args.dest
    if not dest.is_absolute():
        dest = (Path(__file__).resolve().parent / dest).resolve()
    dest.mkdir(parents=True, exist_ok=True)

    n = 0
    for top in sorted(ASSETS.iterdir()):
        if not top.is_dir() or top.name in SKIP_DIRS:
            continue
        for p in sorted(top.rglob("*")):
            if not p.is_file():
                continue
            if p.suffix.lower() not in IMG_EXT:
                continue
            if portraits_only:
                if _path_has_unknown(p, ASSETS):
                    continue
                if not _under_person_cluster(p, ASSETS):
                    continue
                if _is_junk_file(p):
                    continue
            try:
                rel = p.relative_to(ASSETS)
            except ValueError:
                rel = p.name
            out_name = _safe_name(rel)
            if Path(out_name).suffix.lower() not in IMG_EXT:
                out_name = out_name + p.suffix
            out = dest / out_name
            if out.exists():
                stem = out.stem
                suf = out.suffix
                k = 1
                while out.exists():
                    out = dest / f"{stem}_{k}{suf}"
                    k += 1
            shutil.copy2(p, out)
            n += 1
            print(f"OK {n}: {p.name} -> {out.name}")

    mode = "portraits-only" if portraits_only else "all"
    print(f"\nDone. [{mode}] Copied {n} files to {dest}")


if __name__ == "__main__":
    main()
