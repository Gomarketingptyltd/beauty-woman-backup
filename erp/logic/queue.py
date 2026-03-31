"""
Technician Queue  —  V1.4 定稿

规则：
- 点钟（Request）优先于轮牌（Rotation）
- 点钟失败（Busy/Offline）→ 不可开单
- 轮牌：FIFO，排序依赖签到时间戳（last_queue_ts）
- 退单换人：回到队尾
- 允许暂停接客（paused）
"""
from __future__ import annotations

from core.business_day import now_sydney
from core.config import TECH_BUSY, TECH_OFFLINE
from core.database import DB


def get_available_queue(database: DB) -> list[dict]:
    """
    Return list of technicians in FIFO order who are 'available'.
    """
    rows = database.all(
        """
        SELECT id, code, display_name, status, queue_position, last_queue_ts
        FROM technicians
        WHERE status = 'available' AND is_active = 1
        ORDER BY last_queue_ts ASC NULLS LAST, id ASC
        """
    )
    return [dict(r) for r in rows]


def get_all_active(database: DB) -> list[dict]:
    """All active technicians with status."""
    rows = database.all(
        """
        SELECT id, code, display_name, status, queue_position, last_queue_ts,
               price_cents, specialty, languages
        FROM technicians WHERE is_active = 1 ORDER BY code ASC
        """
    )
    return [dict(r) for r in rows]


def check_request(database: DB, tech_id: int) -> bool:
    """
    Returns True if tech is available for a direct request (点钟).
    Raises ValueError if tech is Busy/Offline (cannot open order).
    """
    row = database.one(
        "SELECT status FROM technicians WHERE id=? AND is_active=1",
        (tech_id,),
    )
    if not row:
        raise ValueError("tech_not_found")
    status = str(row["status"])
    if status in (TECH_BUSY, TECH_OFFLINE):
        raise ValueError(f"tech_{status}")
    return True


def assign_tech(database: DB, tech_id: int) -> None:
    """Mark tech as busy (called after order is confirmed)."""
    database.execute(
        "UPDATE technicians SET status='busy' WHERE id=?",
        (tech_id,),
    )


def release_tech_to_queue_tail(database: DB, tech_id: int) -> None:
    """
    After void/退单: set tech back to 'available', queue position = tail.
    Tail = max(last_queue_ts) so this tech will be last in FIFO.
    """
    now_str = now_sydney().isoformat()
    database.execute(
        """
        UPDATE technicians
        SET status='available', last_queue_ts=?, queue_position=NULL
        WHERE id=?
        """,
        (now_str, tech_id),
    )


def checkin_tech(database: DB, tech_id: int) -> None:
    """Sign-on: set status available, record queue entry timestamp."""
    now_str = now_sydney().isoformat()
    database.execute(
        """
        UPDATE technicians
        SET status='available', last_queue_ts=?
        WHERE id=?
        """,
        (now_str, tech_id),
    )
    # Update today's schedule record
    database.execute(
        """
        UPDATE schedules SET checkin_at=?, is_present=1
        WHERE technician_id=? AND work_date=date('now','localtime')
          AND checkin_at IS NULL
        """,
        (now_str, tech_id),
    )


def checkout_tech(database: DB, tech_id: int) -> None:
    """
    技师签退：设 offline，并释放其关联占用房（正常业务下房间恢复空闲的唯一路径）。
    """
    now_str = now_sydney().isoformat()

    # 路径 1：最近一笔 paid 订单对应的房间
    active_order = database.one(
        """
        SELECT room_id FROM orders
        WHERE technician_id = ? AND status = 'paid'
        ORDER BY id DESC LIMIT 1
        """,
        (tech_id,),
    )
    if active_order and active_order["room_id"]:
        database.execute(
            "UPDATE rooms SET status='free', updated_at=? WHERE id=? AND status='occupied'",
            (now_str, int(active_order["room_id"])),
        )
    else:
        # 路径 2（冗余保护）：无 paid 订单时，释放所有曾出现在该技师任意订单里的 occupied 房间
        database.execute(
            """
            UPDATE rooms SET status='free', updated_at=?
            WHERE status='occupied'
              AND id IN (
                SELECT DISTINCT room_id FROM orders
                WHERE technician_id = ? AND room_id IS NOT NULL
              )
            """,
            (now_str, tech_id),
        )

    database.execute(
        "UPDATE technicians SET status='offline', last_queue_ts=NULL WHERE id=?",
        (tech_id,),
    )
    database.execute(
        """
        UPDATE schedules SET checkout_at=?
        WHERE technician_id=? AND work_date=date('now','localtime')
          AND checkout_at IS NULL
        """,
        (now_str, tech_id),
    )


def pause_tech(database: DB, tech_id: int) -> None:
    """Pause accepting orders (but remain on floor)."""
    database.execute(
        "UPDATE technicians SET status='paused' WHERE id=? AND status='available'",
        (tech_id,),
    )


def resume_tech(database: DB, tech_id: int) -> None:
    """Resume from paused → available; queue tail."""
    now_str = now_sydney().isoformat()
    database.execute(
        """
        UPDATE technicians SET status='available', last_queue_ts=?
        WHERE id=? AND status='paused'
        """,
        (now_str, tech_id),
    )


def next_rotation_tech(database: DB) -> dict | None:
    """
    Return the next technician from rotation (FIFO).
    Returns None if no one is available.
    """
    queue = get_available_queue(database)
    return queue[0] if queue else None
