"""
populate_vms_techs.py
=======================
用人像图片批量写入技师：默认 **50 位女技师，每人 6 张照片**（可改参数）。

数据源：
  - 默认 ``assets/merged_portraits_only``（纯人像平铺目录），或
  - ``assets/reclustered_50`` 等含 ``person_*`` 子目录的聚类结果（只收 person_*，跳过 unknown）。

图片总数不足 50×6 时，会在打乱后的池子里 **循环取样** 凑满每人 6 张，便于测试。

用法：
    python populate_vms_techs.py               # 正式写入
    python populate_vms_techs.py --dry-run   # 仅预览

    python populate_vms_techs.py --input assets/reclustered_50
    python populate_vms_techs.py --techs 50 --per-tech 6 --seed 42
"""

from __future__ import annotations

import argparse
import random
import re
import shutil
import sqlite3
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
DB_PATH = SCRIPT_DIR / "on_vms.db"
DEFAULT_INPUT = SCRIPT_DIR / "assets" / "merged_portraits_only"
UPLOADS_DIR = SCRIPT_DIR / "uploads" / "technicians"

# ---------------------------------------------------------------------------
# 随机数据池
# ---------------------------------------------------------------------------
NATIONALITIES = ["中国", "韩国", "泰国", "越南", "日本", "马来西亚", "澳大利亚"]
LANGUAGES_POOL = [
    "普通话", "粤语", "英语", "韩语", "泰语", "越南语", "日语"
]
SPECIALTIES = [
    "水床推拿", "精油按摩", "泰式推背", "深层组织按摩",
    "热石SPA", "芳疗减压", "淋巴引流", "足底反射",
]
BUSTS = ["32A", "32B", "34B", "34C", "36B", "36C", "34D", "36D"]
BIOS = [
    "温柔细致，让您身心舒缓。",
    "专注每一个细节，给您最优质的体验。",
    "手法娴熟，释放您的压力与疲劳。",
    "阳光开朗，服务用心，欢迎预约。",
    "经验丰富，擅长多种放松技法。",
    "轻柔力度，为您带来极致的放松感受。",
    "热情专业，让您宾至如归。",
]

PRICE_OPTIONS_CENTS = [19_000, 26_000, 32_800, 42_800, 45_800, 48_800, 55_800]

# 50 个中文昵称（与 T001…T050 一一对应）
CHINESE_NAMES = [
    "小雪", "晓晴", "雅婷", "思颖", "美琪", "若汐", "诗涵", "语桐",
    "紫萱", "心怡", "淑贤", "婉儿", "欣妍", "悦宁", "依依", "佳璇",
    "慕雪", "叶澜", "凌云", "锦绣", "婷婷", "莹莹", "柔柔", "甜甜",
    "珊珊", "菲菲", "乐乐", "薇薇", "曦曦", "瑶瑶", "彤彤", "梦梦",
    "蓁蓁", "冰冰", "晴晴", "微微", "灵灵", "夏夏",
    "沫沫", "茜茜", "露露", "妮妮", "琦琦", "琪琪", "娜娜", "倩倩",
    "慧慧", "雯雯", "璐璐", "妍妍",
]

IMG_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
_PERSON_DIR = re.compile(r"^person_\d+$", re.IGNORECASE)
_JUNK_NAMES = frozenset({
    "logo.jpg", "logo.png", "logo.webp", "placeholder.png", "placeholder.jpg",
})


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = OFF;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn


def clear_tech_data(conn: sqlite3.Connection, dry: bool) -> None:
    print("==> 清理旧技师数据...")
    counts = {
        "technician_media": conn.execute(
            "SELECT COUNT(*) FROM technician_media").fetchone()[0],
        "technicians": conn.execute(
            "SELECT COUNT(*) FROM technicians").fetchone()[0],
    }
    print(f"    技师媒体记录: {counts['technician_media']} 条")
    print(f"    技师记录    : {counts['technicians']} 条")
    if not dry:
        conn.execute("DELETE FROM technician_media")
        conn.execute("DELETE FROM technicians")
        conn.commit()
        print("    OK 已清空")
    else:
        print("    [dry-run] 跳过")


def wipe_tech_upload_dirs(dry: bool) -> None:
    """删除 uploads/technicians 下旧子目录，避免残留文件。"""
    if dry or not UPLOADS_DIR.exists():
        return
    print("==> 清空 uploads/technicians 下旧目录...")
    n = 0
    for child in list(UPLOADS_DIR.iterdir()):
        try:
            if child.is_dir():
                shutil.rmtree(child)
                n += 1
            elif child.is_file():
                child.unlink()
                n += 1
        except OSError as e:
            print(f"    [WARN] 无法删除 {child}: {e}")
    print(f"    OK 已处理 {n} 项")


def gather_portrait_images(src_root: Path) -> list[Path]:
    """
    收集人像图：
    - 若存在 person_* 子目录：只从各 person_* 内取图（跳过 unknown）
    - 否则：从 src_root 根目录取所有图片（平铺目录）
    """
    imgs: list[Path] = []
    subs = [d for d in src_root.iterdir() if d.is_dir()]
    person_like = [d for d in subs if _PERSON_DIR.match(d.name)]
    if "unknown" in {d.name.lower() for d in subs}:
        pass  # 只从 person_* 取时不会进 unknown

    if person_like:
        for d in sorted(person_like, key=lambda x: x.name.lower()):
            for f in sorted(d.iterdir()):
                if not f.is_file():
                    continue
                if f.suffix.lower() not in IMG_EXT:
                    continue
                if f.name.lower() in _JUNK_NAMES:
                    continue
                imgs.append(f)
    else:
        for f in sorted(src_root.iterdir()):
            if not f.is_file():
                continue
            if f.suffix.lower() not in IMG_EXT:
                continue
            if f.name.lower() in _JUNK_NAMES:
                continue
            imgs.append(f)
    return imgs


def build_photo_plan(
    sources: list[Path],
    num_techs: int,
    per_tech: int,
    seed: int,
) -> list[list[Path]]:
    """
    生成 num_techs 组，每组 per_tech 张 Path；不足则循环使用打乱后的池。
    """
    need = num_techs * per_tech
    if not sources:
        return []
    rng = random.Random(seed)
    pool = sources[:]
    rng.shuffle(pool)
    flat: list[Path] = []
    i = 0
    while len(flat) < need:
        flat.append(pool[i % len(pool)])
        i += 1
    return [flat[t * per_tech : (t + 1) * per_tech] for t in range(num_techs)]


def copy_tech_photos(
    tech_id: int,
    src_list: list[Path],
    dry: bool,
) -> list[str]:
    """复制到 uploads/technicians/<tech_id>/，返回相对路径列表（相对 TECH_UPLOADS 根）。"""
    rel_paths: list[str] = []
    dest_dir = UPLOADS_DIR / str(tech_id)
    for order, src in enumerate(src_list):
        ext = src.suffix.lower() or ".jpg"
        safe = re.sub(r"[^\w\-.]", "_", src.stem)[:40]
        fname = f"m{order:02d}_{safe}{ext}"
        dest_file = dest_dir / fname
        rel = str((dest_dir / fname).relative_to(UPLOADS_DIR)).replace("\\", "/")
        rel_paths.append(rel)
        if not dry:
            dest_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dest_file)
    return rel_paths


def insert_technician(conn: sqlite3.Connection, idx: int, name: str) -> int:
    rng = random.Random(idx)

    code = f"T{idx:03d}"
    nationality = rng.choice(NATIONALITIES)
    age = rng.randint(22, 35)
    bust = rng.choice(BUSTS)
    weight_kg = round(rng.uniform(46.0, 58.0), 1)
    height_cm = round(rng.uniform(158.0, 172.0), 1)
    langs = ", ".join(rng.sample(LANGUAGES_POOL, k=rng.randint(1, 3)))
    specialty = rng.choice(SPECIALTIES)
    price_cents = rng.choice(PRICE_OPTIONS_CENTS)
    bio = rng.choice(BIOS)

    cur = conn.execute(
        """
        INSERT INTO technicians
            (code, display_name, nationality, age, bust, weight_kg, height_cm,
             languages, specialty, price_cents, bio, status, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'offline', 1)
        """,
        (code, name, nationality, age, bust, weight_kg, height_cm,
         langs, specialty, price_cents, bio),
    )
    return int(cur.lastrowid)


def insert_media(conn: sqlite3.Connection, tech_id: int, rel_paths: list[str]) -> None:
    for order, rel in enumerate(rel_paths):
        ext = Path(rel).suffix.lower()
        mime = (
            "image/jpeg" if ext in {".jpg", ".jpeg"} else
            "image/png" if ext == ".png" else
            "image/webp" if ext == ".webp" else "image/jpeg"
        )
        conn.execute(
            """
            INSERT INTO technician_media (technician_id, relative_path, mime_type, kind, sort_order)
            VALUES (?, ?, ?, 'image', ?)
            """,
            (tech_id, rel, mime, order),
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="批量写入女技师与人像照片")
    parser.add_argument("--dry-run", action="store_true", help="仅预览，不写库/不复制文件")
    parser.add_argument("--input", type=str, default=str(DEFAULT_INPUT), help="人像图片目录")
    parser.add_argument("--techs", type=int, default=50, help="技师人数")
    parser.add_argument("--per-tech", type=int, default=6, help="每位技师照片数")
    parser.add_argument("--seed", type=int, default=42, help="抽样随机种子（可复现）")
    args = parser.parse_args()

    dry = args.dry_run
    src_root = Path(args.input)
    if not src_root.is_absolute():
        src_root = (SCRIPT_DIR / src_root).resolve()
    num_techs = max(1, int(args.techs))
    per_tech = max(1, min(10, int(args.per_tech)))  # 与 MAX_TECH_MEDIA 对齐
    seed = int(args.seed)

    if not src_root.exists():
        print(f"[ERROR] 输入目录不存在: {src_root}")
        sys.exit(1)
    if not DB_PATH.exists():
        print(f"[ERROR] 数据库不存在: {DB_PATH}")
        sys.exit(1)

    if len(CHINESE_NAMES) < num_techs:
        print(f"[WARN] 内置昵称仅 {len(CHINESE_NAMES)} 个，超出部分将用「技师###」")

    all_imgs = gather_portrait_images(src_root)
    plan = build_photo_plan(all_imgs, num_techs, per_tech, seed)

    print(f"输入目录: {src_root}")
    print(f"收集到人像文件: {len(all_imgs)} 张")
    print(f"目标: {num_techs} 人 × {per_tech} 张 = {num_techs * per_tech} 张")
    if not all_imgs:
        print("[ERROR] 没有找到任何人像图片（请使用 merged_portraits_only 或 reclustered_50/person_*）")
        sys.exit(1)

    if dry:
        print("\n[dry-run] 预览前 5 位分配:")
        for t in range(min(5, len(plan))):
            codes = [p.name for p in plan[t]]
            print(f"  T{t+1:03d}: {codes}")
        print(f"\n[dry-run] 将写入 {num_techs} 位技师；不修改数据库与文件")
        return

    conn = get_connection()
    try:
        wipe_tech_upload_dirs(dry=False)
        clear_tech_data(conn, dry=False)

        total_photos = 0
        for t in range(num_techs):
            idx = t + 1
            name = (
                CHINESE_NAMES[t] if t < len(CHINESE_NAMES) else f"技师{idx:03d}"
            )
            tech_id = insert_technician(conn, idx, name)
            rel_paths = copy_tech_photos(tech_id, plan[t], dry=False)
            insert_media(conn, tech_id, rel_paths)
            total_photos += len(rel_paths)
            if rel_paths:
                conn.execute(
                    "UPDATE technicians SET photo_path=? WHERE id=?",
                    (rel_paths[0], tech_id),
                )
            print(f"  OK T{idx:03d} {name} (id={tech_id}) — {len(rel_paths)} 张")

        conn.commit()
        print(f"\n完成: {num_techs} 位技师, 共 {total_photos} 张照片 -> {UPLOADS_DIR}")
    except Exception as exc:
        conn.rollback()
        print(f"\n[ERROR] {exc}")
        raise
    finally:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.close()


if __name__ == "__main__":
    main()
