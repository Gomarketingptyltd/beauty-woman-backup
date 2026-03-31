"""
Global constants and path configuration.

货币：统一为 **澳元 (AUD)**。
库内金额一律以 **澳分**（AUD 的最小货币单位，整数）存储，字段名沿用 *_cents 表示「澳分」而非美元分。
"""
from __future__ import annotations

from pathlib import Path
from zoneinfo import ZoneInfo

from core.version import APP_VERSION

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
APP_ROOT = Path(__file__).resolve().parents[1]
DB_PATH = APP_ROOT / "on_vms.db"
LOGO_PATH = APP_ROOT / "assets" / "images" / "logo.png"
CSS_PATH = APP_ROOT / "assets" / "styles" / "global.css"
# Technician photos/videos (relative keys stored in DB: "{tech_id}/{filename}")
UPLOADS_ROOT = APP_ROOT / "uploads"
TECH_UPLOAD_DIR = UPLOADS_ROOT / "technicians"

# ---------------------------------------------------------------------------
# Time
# ---------------------------------------------------------------------------
TIMEZONE = ZoneInfo("Australia/Sydney")

# Business day starts at 08:00 (same calendar day) and ends at 08:00 next day.
BUSINESS_DAY_START_HOUR = 8   # 08:00 inclusive
BUSINESS_DAY_END_HOUR = 8     # 08:00 next day exclusive (< 08:00)

# Referral reward scheduled batch time within the business day's "next day"
REFERRAL_BATCH_HOUR = 9       # 09:00 next day

# ---------------------------------------------------------------------------
# Roles
# ---------------------------------------------------------------------------
ROLE_ADMIN = "ADMIN"           # 管理员 — full access, can void
ROLE_MANAGER = "MANAGER"       # 店长 — can void, no system config
ROLE_STAFF = "STAFF"           # 前台/财务 — cannot void
ROLE_TECH = "TECH"             # 技师 — own queue + commission only

ROLES_CAN_VOID = {ROLE_ADMIN, ROLE_MANAGER}
ROLES_OPERATIONAL = {ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF}

# ---------------------------------------------------------------------------
# Member tiers
# ---------------------------------------------------------------------------
TIER_CASUAL = "Casual"
TIER_STANDARD = "Standard"
TIER_VIP = "VIP"
TIER_BOARD = "Board"

MEMBER_TIERS = [TIER_CASUAL, TIER_STANDARD, TIER_VIP, TIER_BOARD]

# ---------------------------------------------------------------------------
# Financial constants（澳元 AUD，库内为澳分 INTEGER）
# ---------------------------------------------------------------------------
CASHBACK_UNIT_CENTS = 2_000      # 每满 200 澳元 → 返 10 澳元的步进单位（澳分）
CASHBACK_THRESHOLD_CENTS = 20_000  # 200 澳元 = 20000 澳分，返利分段基数
CASHBACK_REWARD_CENTS = 1_000    # 每段返利 10 澳元 = 1000 澳分

REFERRAL_REWARD_CENTS = 5_000    # 50 澳元推荐奖励

BOARD_MONTHLY_ALLOWANCE_CENTS = 40_000  # 400 澳元
BOARD_RENEWAL_WARNING_CENTS = 1_500_000 # 15 000 澳元

TECH_COMMISSION_RATE_NUMERATOR = 6       # 60 %
TECH_COMMISSION_RATE_DENOMINATOR = 10

# ---------------------------------------------------------------------------
# Room layout
# ---------------------------------------------------------------------------
SERVICE_ROOMS = 15
WAITING_ROOMS = 3
PUBLIC_AREA = 1

ROOM_STATUS_FREE = "free"
ROOM_STATUS_OCCUPIED = "occupied"
ROOM_STATUS_CLEANING = "cleaning"
ROOM_STATUS_MAINTENANCE = "maintenance"

# ---------------------------------------------------------------------------
# Tech / Order status
# ---------------------------------------------------------------------------
TECH_AVAILABLE = "available"
TECH_BUSY = "busy"
TECH_OFFLINE = "offline"
TECH_PAUSED = "paused"

ORDER_DRAFT = "draft"
ORDER_PAID = "paid"
ORDER_VOIDED = "voided"

PAYMENT_CASH = "cash"
PAYMENT_MEMBER = "member_account"

TX_TOPUP = "topup"
TX_SPEND = "spend"
TX_CASHBACK = "cashback"
TX_REFERRAL = "referral"
TX_VOID = "void"
TX_ADJUST = "adjust"
