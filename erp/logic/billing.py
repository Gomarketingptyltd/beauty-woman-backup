"""
Billing Engine  —  V1.4 定稿

核心规则：
1. 货币为澳元 (AUD)；库内以「澳分」整数运算，禁止浮点参与财务逻辑。
2. 返利基数 = 订单原价合计（含税、含服务费/房间费）；不含小费（本行业无小费）。
3. cashback = floor(items_total / 20000) * 1000  （每满 200 澳元返 10 澳元，库内为澳分）
4. 技师提成 = 按订单行 unit_price * qty * 0.6（向下取整到分），再汇总。
   提成不受「奖励抵扣」影响。
5. 扣款顺序：先扣 principal，不足再扣 reward。
6. Board 会员余额不足 → 禁止开单（扣款）。
7. 业务语义：先收款；`create_order` 成功 = 服务开始（占房、技师 busy），非服务结束。
   房间恢复空闲：正常为技师签退 `checkout_tech`；冲正 `void_order` 为管理例外（取消服务并释房）。
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from core.config import (
    CASHBACK_REWARD_CENTS,
    CASHBACK_THRESHOLD_CENTS,
    PAYMENT_CASH,
    PAYMENT_MEMBER,
    TECH_COMMISSION_RATE_DENOMINATOR,
    TECH_COMMISSION_RATE_NUMERATOR,
    TIER_CASUAL,
    TX_CASHBACK,
    TX_SPEND,
    TX_TOPUP,
    TX_VOID,
)
from core.business_day import current_business_day, now_sydney
from core.database import DB, next_order_no


# ---------------------------------------------------------------------------
# Line item dataclass
# ---------------------------------------------------------------------------

@dataclass
class OrderLine:
    description: str
    unit_price_cents: int   # AUD 澳分，标价（提成基数）
    qty: int = 1

    @property
    def line_total_cents(self) -> int:
        return self.unit_price_cents * self.qty

    @property
    def commission_cents(self) -> int:
        """Tech 60% of original price, integer division (floor)."""
        return (self.unit_price_cents * self.qty * TECH_COMMISSION_RATE_NUMERATOR) \
               // TECH_COMMISSION_RATE_DENOMINATOR


# ---------------------------------------------------------------------------
# Billing result
# ---------------------------------------------------------------------------

@dataclass
class BillResult:
    order_id: int
    order_no: str
    items_total_cents: int
    cashback_cents: int
    principal_used_cents: int
    reward_used_cents: int
    cash_paid_cents: int
    tech_commission_total_cents: int
    new_principal_cents: int
    new_reward_cents: int
    board_warning: bool = False
    error: str = ""


# ---------------------------------------------------------------------------
# Cashback calculation (pure, no side effects)
# ---------------------------------------------------------------------------

def calc_cashback(items_total_cents: int) -> int:
    """
    Returns cashback in AUD 澳分.
    Rule: floor(total / 20000) * 1000
    (每 20000 澳分 = 200 澳元 → 返 1000 澳分 = 10 澳元)
    Casual tier gets 0 cashback; caller must pass 0 for Casual.
    """
    if items_total_cents <= 0:
        return 0
    return (items_total_cents // CASHBACK_THRESHOLD_CENTS) * CASHBACK_REWARD_CENTS


def calc_tech_commission(lines: list[OrderLine]) -> int:
    """Sum of per-line commission (AUD 澳分, floor per line)."""
    return sum(ln.commission_cents for ln in lines)


# ---------------------------------------------------------------------------
# Member deduction (returns principal_used, reward_used or raises)
# ---------------------------------------------------------------------------

@dataclass
class DeductionPlan:
    principal_used_cents: int
    reward_used_cents: int


def plan_member_deduction(
    amount_cents: int,
    principal_cents: int,
    reward_cents: int,
    tier: str,
) -> DeductionPlan:
    """
    Plan how to deduct `amount_cents` from member account.
    Rule: first principal, then reward.
    Board: raises ValueError('insufficient_balance') if total < amount.
    Non-board: same constraint (余额不足不允许结账 for all tiers using account).
    """
    total_available = principal_cents + reward_cents
    if total_available < amount_cents:
        raise ValueError("insufficient_balance")

    principal_used = min(principal_cents, amount_cents)
    remainder = amount_cents - principal_used
    reward_used = remainder  # guaranteed reward_cents >= remainder at this point
    return DeductionPlan(principal_used, reward_used)


# ---------------------------------------------------------------------------
# Create order (atomic)
# ---------------------------------------------------------------------------

def create_order(
    *,
    database: DB,
    technician_id: int,
    room_id: int,
    staff_id: int,
    lines: list[OrderLine],
    payment_method: str,          # PAYMENT_CASH or PAYMENT_MEMBER
    member_id: Optional[int] = None,
    is_new_customer: bool = False,
    referrer_id: Optional[int] = None,
    note: str = "",
) -> BillResult:
    """
    先收款、再写入订单：本操作表示「服务开始」（非结束）。
    - 占房：free → occupied（在插入订单前；任一步失败则整笔回滚）
    - 写入订单与明细、会员扣款与 ledger
    - 技师 → busy
    """
    d = database

    bd = current_business_day()
    bd_str = bd.isoformat()
    order_no = next_order_no(bd_str, d)
    now_str = now_sydney().isoformat()

    items_total = sum(ln.line_total_cents for ln in lines)
    tech_commission = calc_tech_commission(lines)

    # ---- Fetch member if needed ----
    principal_cents = 0
    reward_cents = 0
    tier = TIER_CASUAL
    cashback = 0
    principal_used = 0
    reward_used = 0
    cash_paid = 0
    new_principal = 0
    new_reward = 0

    if member_id:
        row = d.one("SELECT * FROM members WHERE id=?", (member_id,))
        if not row:
            raise ValueError("member_not_found")
        tier = str(row["tier"])
        principal_cents = int(row["principal_cents"])
        reward_cents = int(row["reward_cents"])

        if tier != TIER_CASUAL:
            cashback = calc_cashback(items_total)

    if payment_method == PAYMENT_MEMBER and member_id:
        plan = plan_member_deduction(
            items_total, principal_cents, reward_cents, tier
        )
        principal_used = plan.principal_used_cents
        reward_used = plan.reward_used_cents
        cash_paid = 0
    elif payment_method == PAYMENT_CASH:
        cash_paid = items_total
    else:
        # split not implemented in V1, treat as cash
        cash_paid = items_total

    new_principal = principal_cents - principal_used
    new_reward = reward_cents - reward_used + cashback

    from core.config import BOARD_RENEWAL_WARNING_CENTS, TIER_BOARD
    board_warning = (tier == TIER_BOARD and new_principal < BOARD_RENEWAL_WARNING_CENTS)

    conn = d.connect()
    try:
        # 先占房：仅当仍为 free 时更新为 occupied，保证开单后该房不会是「空闲」
        room_chk = conn.execute(
            "SELECT id, status FROM rooms WHERE id=?", (int(room_id),)
        ).fetchone()
        if not room_chk:
            raise ValueError("room_not_found")
        if str(room_chk["status"]) != "free":
            raise ValueError("room_not_free")

        cur_room = conn.execute(
            """
            UPDATE rooms SET status='occupied', updated_at=?
            WHERE id=? AND status='free'
            """,
            (now_str, int(room_id)),
        )
        if cur_room.rowcount != 1:
            raise ValueError("room_occupancy_failed")

        # Insert order
        conn.execute(
            """
            INSERT INTO orders (
              order_no, business_day, member_id, is_new_customer, referrer_id,
              technician_id, room_id, staff_id,
              items_total_cents, cashback_earned_cents,
              principal_used_cents, reward_used_cents, cash_paid_cents,
              payment_method, status, note, created_at, paid_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'paid',?,?,?)
            """,
            (
                order_no, bd_str, member_id,
                1 if is_new_customer else 0,
                referrer_id, technician_id, room_id, staff_id,
                items_total, cashback,
                principal_used, reward_used, cash_paid,
                payment_method, note, now_str, now_str,
            ),
        )
        order_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]

        # Insert order lines
        for ln in lines:
            conn.execute(
                """
                INSERT INTO order_lines
                  (order_id, description, unit_price_cents, qty, line_total_cents, commission_cents)
                VALUES (?,?,?,?,?,?)
                """,
                (order_id, ln.description, ln.unit_price_cents,
                 ln.qty, ln.line_total_cents, ln.commission_cents),
            )

        # Update member balance
        if member_id:
            conn.execute(
                "UPDATE members SET principal_cents=?, reward_cents=? WHERE id=?",
                (new_principal, new_reward, member_id),
            )
            # Ledger: spend
            if principal_used > 0 or reward_used > 0:
                conn.execute(
                    """INSERT INTO ledger
                       (member_id, tx_type, principal_delta, reward_delta, order_id, note, created_by, created_at)
                       VALUES (?,?,?,?,?,?,?,?)""",
                    (member_id, TX_SPEND, -principal_used, -reward_used,
                     order_id, f"Order {order_no}", staff_id, now_str),
                )
            # Ledger: cashback → 进奖励金（reward），不进本金
            if cashback > 0:
                conn.execute(
                    """INSERT INTO ledger
                       (member_id, tx_type, principal_delta, reward_delta, order_id, note, created_by, created_at)
                       VALUES (?,?,?,?,?,?,?,?)""",
                    (member_id, TX_CASHBACK, 0, cashback,
                     order_id, f"Cashback for {order_no}", staff_id, now_str),
                )

        # Referral reward queue entry
        if is_new_customer and referrer_id and member_id:
            from core.config import REFERRAL_REWARD_CENTS
            conn.execute(
                """INSERT OR IGNORE INTO referral_rewards
                   (referrer_id, new_member_id, order_id, business_day, amount_cents, status)
                   VALUES (?,?,?,?,?,'pending')""",
                (referrer_id, member_id, order_id, bd_str, REFERRAL_REWARD_CENTS),
            )

        # Tech → busy
        conn.execute(
            "UPDATE technicians SET status='busy' WHERE id=?",
            (technician_id,),
        )

        conn.commit()
    finally:
        conn.close()

    return BillResult(
        order_id=order_id,
        order_no=order_no,
        items_total_cents=items_total,
        cashback_cents=cashback,
        principal_used_cents=principal_used,
        reward_used_cents=reward_used,
        cash_paid_cents=cash_paid,
        tech_commission_total_cents=tech_commission,
        new_principal_cents=new_principal,
        new_reward_cents=new_reward,
        board_warning=board_warning,
    )


# ---------------------------------------------------------------------------
# Top-up
# ---------------------------------------------------------------------------

def topup_member(
    *,
    database: DB,
    member_id: int,
    amount_cents: int,
    staff_id: int,
    note: str = "",
) -> int:
    """Add to principal. Returns new principal balance in cents."""
    now_str = now_sydney().isoformat()
    conn = database.connect()
    try:
        conn.execute(
            "UPDATE members SET principal_cents = principal_cents + ? WHERE id=?",
            (amount_cents, member_id),
        )
        conn.execute(
            """INSERT INTO ledger
               (member_id, tx_type, principal_delta, reward_delta, note, created_by, created_at)
               VALUES (?,?,?,0,?,?,?)""",
            (member_id, TX_TOPUP, amount_cents, note, staff_id, now_str),
        )
        conn.commit()
    finally:
        conn.close()
    row = database.one("SELECT principal_cents FROM members WHERE id=?", (member_id,))
    return int(row["principal_cents"]) if row else 0


# ---------------------------------------------------------------------------
# Void (冲正)
# ---------------------------------------------------------------------------

def void_order(
    *,
    database: DB,
    order_id: int,
    voided_by: int,
    reason_code: str,
) -> None:
    """
    Reverse an order within the same business day.
    Restores member balance and reverses cashback.
    Releases room and resets tech to available — 管理例外：冲正视为取消当次服务并释房
    （与「正常仅签退释房」并列，仅店长流程使用）。
    """
    from core.business_day import can_void_now

    d = database
    row = d.one("SELECT * FROM orders WHERE id=?", (order_id,))
    if not row:
        raise ValueError("order_not_found")
    if str(row["status"]) != "paid":
        raise ValueError("order_not_paid")

    created_at_str = str(row["created_at"])
    try:
        from zoneinfo import ZoneInfo
        created_dt = datetime.fromisoformat(created_at_str)
    except Exception:
        raise ValueError("invalid_timestamp")

    if not can_void_now(created_dt):
        raise ValueError("void_deadline_passed")

    now_str = now_sydney().isoformat()
    member_id = row["member_id"]
    principal_used = int(row["principal_used_cents"] or 0)
    reward_used = int(row["reward_used_cents"] or 0)
    cashback = int(row["cashback_earned_cents"] or 0)
    room_id = int(row["room_id"])
    tech_id = int(row["technician_id"])
    order_no = str(row["order_no"])
    bd_str = str(row["business_day"])

    conn = d.connect()
    try:
        # Mark original order voided
        conn.execute(
            """UPDATE orders SET status='voided', void_reason_code=?,
               voided_by=?, voided_at=? WHERE id=?""",
            (reason_code, voided_by, now_str, order_id),
        )

        # Restore member balance
        if member_id:
            # Reverse spend: 还回本金和奖励金各自使用的部分
            # Reverse cashback: cashback 当时进了 reward，冲正时从 reward 扣回
            net_reward = reward_used - cashback
            conn.execute(
                """UPDATE members
                   SET principal_cents = principal_cents + ?,
                       reward_cents    = reward_cents    + ?
                   WHERE id=?""",
                (principal_used, net_reward, member_id),
            )
            conn.execute(
                """INSERT INTO ledger
                   (member_id, tx_type, principal_delta, reward_delta, order_id, note, created_by, created_at)
                   VALUES (?,?,?,?,?,?,?,?)""",
                (member_id, TX_VOID, principal_used, net_reward,
                 order_id, f"Void {order_no} / {reason_code}", voided_by, now_str),
            )

        # Cancel any pending referral reward for this order
        conn.execute(
            "UPDATE referral_rewards SET status='cancelled' WHERE order_id=? AND status='pending'",
            (order_id,),
        )

        # Release room
        conn.execute(
            "UPDATE rooms SET status='free', updated_at=? WHERE id=?",
            (now_str, room_id),
        )

        # Tech → available at queue tail
        conn.execute(
            "UPDATE technicians SET status='available', last_queue_ts=? WHERE id=?",
            (now_str, tech_id),
        )

        # Audit log
        conn.execute(
            """INSERT INTO audit_log
               (table_name, record_id, action, field_name, old_value, new_value, performed_by, performed_at)
               VALUES ('orders',?,?,?,?,?,?,?)""",
            (order_id, "VOID", "status", "paid", "voided", voided_by, now_str),
        )

        conn.commit()
    finally:
        conn.close()
