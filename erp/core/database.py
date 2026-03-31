"""
Database — Schema V2  (V1.4 定稿)

规则：
- 所有金额字段为 **澳元 (AUD)**，以 **澳分**（整数）存于数据库；列名 * _cents 表示澳分。
- 时间戳存为 TEXT (ISO-8601, Sydney 时间带 offset)
- 外键全开
"""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Optional

import pandas as pd

from core.config import DB_PATH, TECH_UPLOAD_DIR


# ---------------------------------------------------------------------------
# Core database wrapper
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class DB:
    path: Path = DB_PATH

    def connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(
            str(self.path),
            check_same_thread=False,
            timeout=30,                  # wait up to 30s if locked
        )
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        # WAL mode only needs setting once; ignore the "already WAL" result
        try:
            conn.execute("PRAGMA journal_mode = WAL;")
        except sqlite3.OperationalError:
            pass
        return conn

    def execute(self, sql: str, params: Iterable[Any] = ()) -> None:
        conn = self.connect()
        try:
            conn.execute(sql, tuple(params))
            conn.commit()
        finally:
            conn.close()

    def execute_insert(self, sql: str, params: Iterable[Any] = ()) -> int:
        """INSERT and return sqlite lastrowid."""
        conn = self.connect()
        try:
            cur = conn.execute(sql, tuple(params))
            conn.commit()
            return int(cur.lastrowid)
        finally:
            conn.close()

    def executemany(self, sql: str, seq: Iterable[Iterable[Any]]) -> None:
        conn = self.connect()
        try:
            conn.executemany(sql, [tuple(r) for r in seq])
            conn.commit()
        finally:
            conn.close()

    def one(self, sql: str, params: Iterable[Any] = ()) -> Optional[dict]:
        conn = self.connect()
        try:
            row = conn.execute(sql, tuple(params)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def all(self, sql: str, params: Iterable[Any] = ()) -> list[dict]:
        conn = self.connect()
        try:
            return [dict(r) for r in conn.execute(sql, tuple(params)).fetchall()]
        finally:
            conn.close()

    def df(self, sql: str, params: Iterable[Any] = ()) -> pd.DataFrame:
        conn = self.connect()
        try:
            return pd.read_sql_query(sql, conn, params=tuple(params))
        finally:
            conn.close()


# Module-level default DB instance
db = DB()


# ---------------------------------------------------------------------------
# Schema creation (idempotent)
# ---------------------------------------------------------------------------

DDL = """
-- ============================================================
-- Users / Staff accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL CHECK(role IN ('ADMIN','MANAGER','STAFF','TECH')),
    display_name  TEXT,
    phone         TEXT,
    contact_other TEXT,
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Members
-- ============================================================
CREATE TABLE IF NOT EXISTS members (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    code            TEXT    UNIQUE NOT NULL,   -- 4-digit zero-padded e.g. 0001
    display_name    TEXT    NOT NULL,
    phone           TEXT,
    contact_other   TEXT,
    tier            TEXT    NOT NULL DEFAULT 'Casual'
                            CHECK(tier IN ('Casual','Standard','VIP','Board')),
    -- All balances in CENTS (Integer)
    principal_cents INTEGER NOT NULL DEFAULT 0,  -- AUD 澳分
    reward_cents    INTEGER NOT NULL DEFAULT 0,  -- AUD 澳分
    annual_fee_paid INTEGER NOT NULL DEFAULT 0,
    notes           TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    created_by      INTEGER REFERENCES users(id)
);

-- ============================================================
-- Technicians
-- ============================================================
CREATE TABLE IF NOT EXISTS technicians (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER REFERENCES users(id),  -- linked staff login (TECH role)
    code            TEXT    UNIQUE NOT NULL,        -- e.g. T001
    display_name    TEXT    NOT NULL,
    photo_path      TEXT,
    nationality     TEXT,
    age             INTEGER,
    bust            TEXT,   -- e.g. "34C"
    weight_kg       REAL,
    height_cm       REAL,
    languages       TEXT,   -- comma-separated
    specialty       TEXT,
    price_cents     INTEGER NOT NULL DEFAULT 0,  -- AUD 澳分，标价
    bio             TEXT,
    status          TEXT    NOT NULL DEFAULT 'offline'
                            CHECK(status IN ('available','busy','offline','paused')),
    queue_position  INTEGER,        -- NULL = not in queue; integer = FIFO position
    last_queue_ts   TEXT,           -- timestamp of last queue insertion
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Rooms
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    code        TEXT    UNIQUE NOT NULL,  -- e.g. S01-S15, W1-W3, PUB
    room_type   TEXT    NOT NULL CHECK(room_type IN ('service','waiting','public')),
    status      TEXT    NOT NULL DEFAULT 'free'
                        CHECK(status IN ('free','occupied','cleaning','maintenance')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_by  INTEGER REFERENCES users(id)
);

-- ============================================================
-- Schedules (weekly roster)
-- ============================================================
CREATE TABLE IF NOT EXISTS schedules (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    technician_id  INTEGER NOT NULL REFERENCES technicians(id),
    work_date      TEXT    NOT NULL,   -- YYYY-MM-DD (Sydney)
    checkin_at     TEXT,               -- actual sign-on datetime
    checkout_at    TEXT,               -- actual sign-off datetime
    is_present     INTEGER NOT NULL DEFAULT 0,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no        TEXT    UNIQUE NOT NULL,   -- e.g. ON-20250320-0001
    business_day    TEXT    NOT NULL,          -- YYYY-MM-DD (financial BD)
    member_id       INTEGER REFERENCES members(id),  -- NULL = walk-in cash
    is_new_customer INTEGER NOT NULL DEFAULT 0,
    referrer_id     INTEGER REFERENCES members(id),  -- referral link
    technician_id   INTEGER NOT NULL REFERENCES technicians(id),
    room_id         INTEGER NOT NULL REFERENCES rooms(id),
    staff_id        INTEGER REFERENCES users(id),  -- front-desk who created
    -- All amounts in CENTS
    items_total_cents       INTEGER NOT NULL DEFAULT 0,  -- AUD 澳分，明细合计
    cashback_earned_cents   INTEGER NOT NULL DEFAULT 0,  -- AUD 澳分，返利进本金
    principal_used_cents    INTEGER NOT NULL DEFAULT 0,  -- AUD 澳分
    reward_used_cents       INTEGER NOT NULL DEFAULT 0,  -- AUD 澳分
    cash_paid_cents         INTEGER NOT NULL DEFAULT 0,  -- AUD 澳分，现结
    payment_method  TEXT    NOT NULL CHECK(payment_method IN ('cash','member_account','split')),
    status          TEXT    NOT NULL DEFAULT 'draft'
                            CHECK(status IN ('draft','paid','voided')),
    note            TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    paid_at         TEXT,
    -- Void fields
    void_reason_code  TEXT,
    void_original_id  INTEGER REFERENCES orders(id),
    voided_by         INTEGER REFERENCES users(id),
    voided_at         TEXT
);

-- ============================================================
-- Order Lines (one row per service item)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_lines (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id      INTEGER NOT NULL REFERENCES orders(id),
    description   TEXT    NOT NULL,
    unit_price_cents INTEGER NOT NULL,   -- AUD 澳分，标价（提成基数）
    qty           INTEGER NOT NULL DEFAULT 1,
    line_total_cents INTEGER NOT NULL,  -- AUD 澳分
    commission_cents INTEGER NOT NULL DEFAULT 0  -- AUD 澳分，技师提成
);

-- ============================================================
-- Member ledger (immutable transaction log)
-- ============================================================
CREATE TABLE IF NOT EXISTS ledger (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id       INTEGER NOT NULL REFERENCES members(id),
    tx_type         TEXT    NOT NULL
                            CHECK(tx_type IN ('topup','spend','cashback','referral','void','adjust')),
    -- positive = credit, negative = debit; AUD 澳分
    principal_delta INTEGER NOT NULL DEFAULT 0,
    reward_delta    INTEGER NOT NULL DEFAULT 0,
    order_id        INTEGER REFERENCES orders(id),
    note            TEXT,
    created_by      INTEGER REFERENCES users(id),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Referral rewards queue (pending → paid)
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_rewards (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_id     INTEGER NOT NULL REFERENCES members(id),
    new_member_id   INTEGER NOT NULL REFERENCES members(id),
    order_id        INTEGER NOT NULL REFERENCES orders(id),
    business_day    TEXT    NOT NULL,    -- BD of the qualifying order
    amount_cents    INTEGER NOT NULL,  -- AUD 澳分，推荐奖励额
    status          TEXT    NOT NULL DEFAULT 'pending'
                            CHECK(status IN ('pending','paid','cancelled')),
    paid_at         TEXT,
    UNIQUE(referrer_id, new_member_id, order_id)
);

-- ============================================================
-- Audit log (every mutation with who/when/before/after)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name  TEXT NOT NULL,
    record_id   INTEGER,
    action      TEXT NOT NULL,   -- INSERT / UPDATE / VOID / ADJUST
    field_name  TEXT,
    old_value   TEXT,
    new_value   TEXT,
    performed_by INTEGER REFERENCES users(id),
    performed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Technician media (photos / videos), max 10 per technician (enforced in app)
-- ============================================================
CREATE TABLE IF NOT EXISTS technician_media (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    technician_id   INTEGER NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    relative_path   TEXT NOT NULL,
    mime_type       TEXT,
    kind            TEXT NOT NULL CHECK(kind IN ('image','video')),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_technician_media_tid ON technician_media(technician_id);
"""


def init_db(path: Path | None = None) -> DB:
    """Create all tables (idempotent). Returns DB instance."""
    target = DB(path) if path else DB()
    target.path.parent.mkdir(parents=True, exist_ok=True)
    TECH_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    conn = target.connect()
    try:
        conn.executescript(DDL)
        conn.commit()
        _seed_rooms(conn)
        conn.commit()
        _heal_room_status(conn)
        conn.commit()
    finally:
        conn.close()
    return target


def _heal_room_status(conn: sqlite3.Connection) -> None:
    """
    自洽修复：启动时纠偏房态。正常释房应通过签退或冲正，此处仅处理明显脏数据。
    1. occupied 但关联技师已被删除
    2. occupied 但该房最新 paid 订单对应技师已不是 busy（数据不一致时的纠偏）
    2b. free 但 busy 技师最新 paid 仍指向该房 → 标 occupied
    3. occupied 但库内无任何订单引用该房
    4. occupied 但没有任何订单记录
    """
    from datetime import datetime, timezone
    now_str = datetime.now(timezone.utc).isoformat()

    # 场景 1：技师已删除（LEFT JOIN 后 t.id IS NULL）
    conn.execute(
        """
        UPDATE rooms SET status = 'free', updated_at = ?
        WHERE status = 'occupied'
          AND id IN (
            SELECT DISTINCT o.room_id
            FROM orders o
            LEFT JOIN technicians t ON o.technician_id = t.id
            WHERE t.id IS NULL
          )
        """,
        (now_str,),
    )

    # 场景 2：技师存在但不是 busy
    conn.execute(
        """
        UPDATE rooms SET status = 'free', updated_at = ?
        WHERE status = 'occupied'
          AND id IN (
            SELECT o.room_id
            FROM orders o
            JOIN technicians t ON o.technician_id = t.id
            WHERE o.status = 'paid'
              AND t.status != 'busy'
              AND o.id = (
                SELECT MAX(o2.id) FROM orders o2
                WHERE o2.room_id = o.room_id AND o2.status = 'paid'
              )
          )
        """,
        (now_str,),
    )

    # 场景 2b：忙碌技师当前服务订单对应的房间在 DB 中仍为 free → 标为 occupied
    conn.execute(
        """
        UPDATE rooms SET status = 'occupied', updated_at = ?
        WHERE status = 'free'
          AND id IN (
            SELECT o.room_id
            FROM orders o
            JOIN technicians t ON o.technician_id = t.id AND t.status = 'busy'
            WHERE o.status = 'paid'
              AND o.room_id IS NOT NULL
              AND o.id = (
                SELECT MAX(o2.id) FROM orders o2
                WHERE o2.technician_id = o.technician_id AND o2.status = 'paid'
              )
          )
        """,
        (now_str,),
    )

    # 场景 3 & 4：没有任何订单（paid 或全部）关联
    conn.execute(
        """
        UPDATE rooms SET status = 'free', updated_at = ?
        WHERE status = 'occupied'
          AND id NOT IN (SELECT DISTINCT room_id FROM orders WHERE room_id IS NOT NULL)
        """,
        (now_str,),
    )


def _seed_rooms(conn: sqlite3.Connection) -> None:
    """Insert rooms if not already present."""
    existing = conn.execute("SELECT COUNT(*) FROM rooms").fetchone()[0]
    if existing > 0:
        return

    rooms: list[tuple[str, str]] = []
    # 15 service rooms S01–S15
    for i in range(1, 16):
        rooms.append((f"S{i:02d}", "service"))
    # 3 waiting rooms W01–W03
    for i in range(1, 4):
        rooms.append((f"W{i:02d}", "waiting"))
    # 1 public area
    rooms.append(("PUB", "public"))

    conn.executemany(
        "INSERT INTO rooms (code, room_type, status) VALUES (?, ?, 'free')",
        rooms,
    )


# ---------------------------------------------------------------------------
# Money helpers — 统一澳元 (AUD)，库内为澳分 (integer)
# ---------------------------------------------------------------------------

def format_aud_cents(aud_cents: int | None) -> str:
    """
    将库内「澳分」格式化为界面展示字符串（中文：xxx.xx 澳元；英文：A$xxx.xx）。
    """
    from core.i18n import get_lang

    if aud_cents is None:
        return "—"
    amt = aud_cents / 100.0
    if get_lang() == "en":
        return f"A${amt:,.2f}"
    return f"{amt:,.2f} 澳元"


def aud_dollars_to_cents(aud_dollars: float) -> int:
    """标价（澳元，可带小数）→ 库内澳分（四舍五入）。"""
    return int(round(aud_dollars * 100))


# 旧名保留，语义与上相同
cents_to_display = format_aud_cents
dollars_to_cents = aud_dollars_to_cents


# ---------------------------------------------------------------------------
# Sequence helpers
# ---------------------------------------------------------------------------

def next_member_code(d: DB | None = None) -> str:
    """Return next available 4-digit zero-padded member code."""
    target = d or db
    row = target.one(
        "SELECT code FROM members ORDER BY CAST(code AS INTEGER) DESC LIMIT 1"
    )
    if row is None:
        return "0001"
    return f"{int(row['code']) + 1:04d}"


def next_order_no(business_day_str: str, d: DB | None = None) -> str:
    """Return next order number for the given business day."""
    target = d or db
    row = target.one(
        "SELECT COUNT(*) AS cnt FROM orders WHERE business_day = ?",
        (business_day_str,),
    )
    seq = (row["cnt"] + 1) if row else 1
    return f"ON-{business_day_str.replace('-','')}-{seq:04d}"
