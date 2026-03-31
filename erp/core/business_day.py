"""
Business Day Engine  —  V1.4 定稿

营业日定义：当日 08:00 → 次日 08:00（Australia/Sydney）
凌晨 05:00 关门后至 08:00 之间的操作仍属「昨日」营业日。
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from core.config import BUSINESS_DAY_START_HOUR, TIMEZONE


def _now_sydney() -> datetime:
    return datetime.now(tz=TIMEZONE)


def now_sydney() -> datetime:
    """Return current datetime in Sydney timezone (naive-safe)."""
    return _now_sydney()


def business_day_start(bd_date: date) -> datetime:
    """
    Return the opening boundary of a business day.
    e.g. business_day_start(2025-03-20) → 2025-03-20 08:00:00 +AEDT
    """
    return datetime(
        bd_date.year, bd_date.month, bd_date.day,
        BUSINESS_DAY_START_HOUR, 0, 0,
        tzinfo=TIMEZONE,
    )


def business_day_end(bd_date: date) -> datetime:
    """
    Return the exclusive closing boundary (next calendar day 08:00).
    e.g. business_day_end(2025-03-20) → 2025-03-21 08:00:00 +AEDT
    """
    next_day = bd_date + timedelta(days=1)
    return datetime(
        next_day.year, next_day.month, next_day.day,
        BUSINESS_DAY_START_HOUR, 0, 0,
        tzinfo=TIMEZONE,
    )


def get_business_day(dt: datetime | None = None) -> date:
    """
    Map any Sydney datetime to the business day (calendar date) it belongs to.

    Rule:
      if dt.hour >= 08:00  →  belongs to dt.date()
      if dt.hour < 08:00   →  belongs to dt.date() - 1 day  (still the previous BD)

    Example:
      2025-03-21 07:59:59 AEDT  →  2025-03-20  (previous BD)
      2025-03-21 08:00:00 AEDT  →  2025-03-21  (new BD)
    """
    if dt is None:
        dt = _now_sydney()
    # Ensure timezone-aware comparison
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=TIMEZONE)
    else:
        dt = dt.astimezone(TIMEZONE)

    if dt.hour < BUSINESS_DAY_START_HOUR:
        return (dt - timedelta(days=1)).date()
    return dt.date()


def current_business_day() -> date:
    """Convenience: business day for right now."""
    return get_business_day(_now_sydney())


def is_same_business_day(dt1: datetime, dt2: datetime) -> bool:
    """Return True if both datetimes fall within the same business day."""
    return get_business_day(dt1) == get_business_day(dt2)


def can_void_now(order_created_at: datetime) -> bool:
    """
    An order may only be voided within the same business day it was created.
    """
    now = _now_sydney()
    return is_same_business_day(order_created_at, now)


def referral_reward_due_before(order_business_day: date) -> datetime:
    """
    Return the datetime after which the referral reward for orders
    on `order_business_day` becomes due (next calendar day 09:00).
    """
    from core.config import REFERRAL_BATCH_HOUR
    next_day = order_business_day + timedelta(days=1)
    return datetime(
        next_day.year, next_day.month, next_day.day,
        REFERRAL_BATCH_HOUR, 0, 0,
        tzinfo=TIMEZONE,
    )


def is_referral_reward_due(order_business_day: date) -> bool:
    """True if the referral reward batch time for this BD has passed."""
    return _now_sydney() >= referral_reward_due_before(order_business_day)
