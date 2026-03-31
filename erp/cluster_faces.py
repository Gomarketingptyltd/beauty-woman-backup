"""
Cluster face images from assets/images into assets/organized (DeepFace version).

Features:
- Detect and embed faces with DeepFace.
- Group similar faces by threshold.
- Move no-face images to unknown folder.
- Save a report CSV.

Usage:
    python cluster_faces.py
    python cluster_faces.py --threshold 0.6 --dry-run
"""

from __future__ import annotations

import argparse
import csv
import shutil
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

from deepface import DeepFace
import numpy as np


SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


@dataclass
class PersonCluster:
    name: str
    encodings: list[np.ndarray] = field(default_factory=list)

    def center(self) -> np.ndarray:
        return np.mean(np.stack(self.encodings), axis=0)


def iter_images(root: Path) -> Iterable[Path]:
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTS:
            yield p


def safe_target_path(target_dir: Path, filename: str) -> Path:
    target = target_dir / filename
    if not target.exists():
        return target
    stem = target.stem
    ext = target.suffix
    i = 1
    while True:
        candidate = target_dir / f"{stem}_{i}{ext}"
        if not candidate.exists():
            return candidate
        i += 1


def cosine_distance(a: np.ndarray, b: np.ndarray) -> float:
    a_norm = np.linalg.norm(a)
    b_norm = np.linalg.norm(b)
    if a_norm == 0 or b_norm == 0:
        return 1.0
    sim = float(np.dot(a, b) / (a_norm * b_norm))
    return 1.0 - sim


def extract_main_face_encoding(
    img_path: Path, model_name: str, detector_backend: str
) -> np.ndarray | None:
    try:
        # DeepFace represent returns list of face dicts; one dict per detected face.
        reps = DeepFace.represent(
            img_path=str(img_path),
            model_name=model_name,
            detector_backend=detector_backend,
            enforce_detection=True,
        )
        if not reps:
            return None
        # Select largest detected face by facial_area.
        def area(rep: dict) -> int:
            fa = rep.get("facial_area") or {}
            w = int(fa.get("w", 0))
            h = int(fa.get("h", 0))
            return max(0, w * h)

        main_rep = max(reps, key=area)
        emb = main_rep.get("embedding")
        if not emb:
            return None
        return np.array(emb, dtype=np.float32)
    except Exception:
        return None


def assign_cluster(
    clusters: list[PersonCluster], encoding: np.ndarray, threshold: float
) -> PersonCluster:
    if not clusters:
        c = PersonCluster(name="person_001", encodings=[encoding])
        clusters.append(c)
        return c

    centers = [c.center() for c in clusters]
    distances = np.array([cosine_distance(cn, encoding) for cn in centers], dtype=np.float32)
    idx = int(np.argmin(distances))
    best_distance = float(distances[idx])

    if best_distance <= threshold:
        clusters[idx].encodings.append(encoding)
        return clusters[idx]

    c = PersonCluster(name=f"person_{len(clusters) + 1:03d}", encodings=[encoding])
    clusters.append(c)
    return c


def count_clusters_for_threshold(encodings: list[np.ndarray], threshold: float) -> int:
    tmp: list[PersonCluster] = []
    for enc in encodings:
        assign_cluster(tmp, enc, threshold)
    return len(tmp)


def pick_threshold_for_target(encodings: list[np.ndarray], target: int, fallback: float) -> float:
    if not encodings or target <= 0:
        return fallback
    candidates = [round(x, 2) for x in np.arange(0.30, 0.81, 0.02)]
    best_t = fallback
    best_gap = 10**9
    best_count = -1
    for t in candidates:
        c = count_clusters_for_threshold(encodings, t)
        gap = abs(c - target)
        if gap < best_gap or (gap == best_gap and t < best_t):
            best_t = t
            best_gap = gap
            best_count = c
    print(
        f"[AUTO] target_clusters={target}, "
        f"picked_threshold={best_t}, estimated_clusters={best_count}"
    )
    return float(best_t)


def main() -> None:
    parser = argparse.ArgumentParser(description="Cluster face images into folders.")
    parser.add_argument("--input", default="assets/images", help="Input images folder.")
    parser.add_argument("--output", default="assets/organized", help="Output root folder.")
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.6,
        help="Cosine distance threshold, lower is stricter. Default 0.6",
    )
    parser.add_argument(
        "--model",
        default="Facenet512",
        choices=["Facenet512", "Facenet", "VGG-Face", "ArcFace"],
        help="DeepFace model name. Default Facenet512",
    )
    parser.add_argument(
        "--detector",
        default="opencv",
        choices=["opencv", "retinaface", "mtcnn", "mediapipe", "ssd"],
        help="Face detector backend. Default opencv",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview actions without moving files.",
    )
    parser.add_argument(
        "--target-clusters",
        type=int,
        default=0,
        help="Auto-pick threshold to approach target clusters (e.g. 20).",
    )
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)
    unknown_dir = output_dir / "unknown"
    report_path = output_dir / "report.csv"

    if not input_dir.exists():
        raise SystemExit(f"Input folder does not exist: {input_dir}")

    output_dir.mkdir(parents=True, exist_ok=True)
    unknown_dir.mkdir(parents=True, exist_ok=True)

    images = list(iter_images(input_dir))
    if not images:
        print(f"No images found in {input_dir}")
        return

    report_rows: list[dict[str, str]] = []
    moved_count = 0

    # First pass: extract embeddings for all images
    face_items: list[tuple[Path, np.ndarray]] = []
    unknown_images: list[Path] = []
    for img in images:
        encoding = extract_main_face_encoding(
            img_path=img,
            model_name=args.model,
            detector_backend=args.detector,
        )
        if encoding is None:
            unknown_images.append(img)
        else:
            face_items.append((img, encoding))

    chosen_threshold = float(args.threshold)
    if args.target_clusters > 0:
        chosen_threshold = pick_threshold_for_target(
            [enc for _, enc in face_items],
            target=int(args.target_clusters),
            fallback=chosen_threshold,
        )

    # Second pass: assign by chosen threshold
    clusters: list[PersonCluster] = []

    for img in unknown_images:
        target = safe_target_path(unknown_dir, img.name)
        report_rows.append(
            {
                "source_path": str(img.as_posix()),
                "target_path": str(target.as_posix()),
                "assigned_group": "unknown",
            }
        )
        if not args.dry_run:
            shutil.move(str(img), str(target))
            moved_count += 1

    for img, encoding in face_items:
        cluster = assign_cluster(clusters, encoding, chosen_threshold)
        person_dir = output_dir / cluster.name
        person_dir.mkdir(parents=True, exist_ok=True)
        target = safe_target_path(person_dir, img.name)
        report_rows.append(
            {
                "source_path": str(img.as_posix()),
                "target_path": str(target.as_posix()),
                "assigned_group": cluster.name,
            }
        )
        if not args.dry_run:
            shutil.move(str(img), str(target))
            moved_count += 1

    with report_path.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=["source_path", "target_path", "assigned_group"])
        w.writeheader()
        w.writerows(report_rows)

    print(f"Images scanned: {len(images)}")
    print(f"People clusters: {len(clusters)}")
    print(f"Unknown (no face): {sum(1 for r in report_rows if r['assigned_group'] == 'unknown')}")
    print(f"Moved: {moved_count}{' (dry-run: 0 moved)' if args.dry_run else ''}")
    print(f"Model: {args.model}, Detector: {args.detector}, Threshold: {chosen_threshold}")
    print(f"Report: {report_path}")


if __name__ == "__main__":
    main()
