"""
Referral Rewards — batch processor  (V1.4)

规则：
- 新客户结账后，推荐人 +50 澳元（5000 澳分）进 reward_cents
- 触发时机：财务营业日次日 09:00（Australia/Sydney）
- 服务器关机后启动补发（幂等，防重复）
"""
from __future__ import annotations

from core.business_day import is_referral_reward_due, now_sydney
from core.config import TX_REFERRAL
from core.database import DB


def process_pending_referral_rewards(database: DB) -> list[dict]:
    """
    Find all pending referral rewards whose business_day batch time has passed,
    credit the referrer's reward_cents, and mark as paid.

    Returns list of processed reward records.
    """
    now_str = now_sydney().isoformat()

    # Find all pending rewards
    pending = database.all(
        """
        SELECT rr.*, m.display_name AS referrer_name
        FROM referral_rewards rr
        JOIN members m ON m.id = rr.referrer_id
        WHERE rr.status = 'pending'
        ORDER BY rr.business_day ASC
        """
    )

    processed = []
    for row in pending:
        bd_str = str(row["business_day"])
        try:
            from datetime import date
            bd = date.fromisoformat(bd_str)
        except Exception:
            continue

        if not is_referral_reward_due(bd):
            continue  # not yet time

        referrer_id = int(row["referrer_id"])
        amount_cents = int(row["amount_cents"])
        order_id = int(row["order_id"])
        reward_id = int(row["id"])

        conn = database.connect()
        try:
            # Credit referrer reward sub-account
            conn.execute(
                "UPDATE members SET reward_cents = reward_cents + ? WHERE id=?",
                (amount_cents, referrer_id),
            )
            # Ledger entry
            conn.execute(
                """
                INSERT INTO ledger
                  (member_id, tx_type, principal_delta, reward_delta,
                   order_id, note, created_at)
                VALUES (?,?,0,?,?,?,?)
                """,
                (
                    referrer_id, TX_REFERRAL, amount_cents,
                    order_id,
                    f"Referral reward for order #{order_id}",
                    now_str,
                ),
            )
            # Mark paid
            conn.execute(
                "UPDATE referral_rewards SET status='paid', paid_at=? WHERE id=?",
                (now_str, reward_id),
            )
            conn.commit()
        finally:
            conn.close()

        processed.append(dict(row))

    return processed
