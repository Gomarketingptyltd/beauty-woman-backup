"""
Home.py — Landing page: full-screen split login + logged-in dashboard.
"""
from __future__ import annotations

import base64
import mimetypes
from html import escape
from pathlib import Path

import streamlit as st

from core.auth import current_user, ensure_default_users, login



from core.business_day import current_business_day
from core.config import APP_VERSION, LOGO_PATH
from core.database import db, init_db
from core.i18n import (
    LANG_LABELS,
    consume_lang_query_param,
    get_lang,
    toggle_lang_session,
    t,
)
from core.ui import inject_css, render_sidebar

_LOGIN_PAGE_TITLES = {"zh": "夜色宫管理系统", "en": "Ocean Noir VMS"}
_early_lang = st.session_state.get("_lang", "zh")
if _early_lang not in ("zh", "en"):
    _early_lang = "zh"
st.set_page_config(
    page_title=_LOGIN_PAGE_TITLES.get(_early_lang, _LOGIN_PAGE_TITLES["zh"]),
    page_icon="🌹",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ============================================================
# GATEWAY — simple access password (internal testing only)
# ============================================================
_GATEWAY_PASSWORD = "888"

if not st.session_state.get("_gateway_ok"):
    st.markdown(
        """
        <style>
        [data-testid="stSidebar"]        { display: none !important; }
        [data-testid="collapsedControl"] { display: none !important; }
        .stApp { background: #141414 !important; }
        section.main > div.block-container {
            max-width: 420px !important;
            margin: 0 auto !important;
            padding-top: 18vh !important;
        }
        .gw-title { text-align:center; color:#eaeaea; font-size:1.6rem;
                    font-weight:700; letter-spacing:.06em; margin-bottom:.25rem; }
        .gw-sub   { text-align:center; color:#666; font-size:.78rem;
                    margin-bottom:2.2rem; letter-spacing:.04em; }
        </style>
        """,
        unsafe_allow_html=True,
    )
    st.markdown("<div class='gw-title'>🌹 OCEAN NOIR</div>", unsafe_allow_html=True)
    st.markdown("<div class='gw-sub'>内部管理系统 · Internal System</div>", unsafe_allow_html=True)
    pwd = st.text_input(
        "访问密码", type="password",
        placeholder="请输入访问密码 · Enter access code",
        label_visibility="collapsed",
    )
    if st.button("进入 Enter", use_container_width=True, type="primary"):
        if pwd == _GATEWAY_PASSWORD:
            st.session_state["_gateway_ok"] = True
            st.rerun()
        else:
            st.error("密码错误 · Incorrect access code")
    st.stop()

if consume_lang_query_param():
    st.rerun()

init_db()
ensure_default_users(db)

try:
    from logic.rewards import process_pending_referral_rewards
    process_pending_referral_rewards(db)
except Exception:
    pass

inject_css()
user = current_user()


def _logo_data_uri(path: Path) -> str:
    """Inline logo for single HTML block (avoids st.image wrapper margins)."""
    if not path.exists():
        return ""
    try:
        mime = mimetypes.guess_type(path.name)[0] or "image/png"
        b64 = base64.standard_b64encode(path.read_bytes()).decode("ascii")
        return f"data:{mime};base64,{b64}"
    except OSError:
        return ""


# ============================================================
# NOT LOGGED IN — full-page split layout
# ============================================================
if user is None:
    # Hide sidebar & reduce default padding for login page
    st.markdown(
        """
        <style>
        /* 与 global.css 同步的 token（本块内重复定义，避免加载顺序或未命中 :root 时整页失效） */
        :root {
            --onl-v0-bg: #141414;
            --onl-v0-fg: #eaeaea;
            --onl-v0-primary: #d4586c;
            --onl-v0-primary-fg: #fafafa;
            --onl-v0-label-fg: rgba(148, 148, 148, 0.7);
            --onl-v0-input-glass: rgba(255, 255, 255, 0.03);
            --onl-v0-input-border: rgba(255, 255, 255, 0.08);
            --onl-v0-input-focus-bg: rgba(255, 255, 255, 0.05);
            --onl-v0-radius-xl: 14px;
        }

        /* 登录页：隐藏侧栏；主区去 padding */
        [data-testid="stSidebar"]        { display: none !important; }
        [data-testid="collapsedControl"] { display: none !important; }

        /* 不用 color-mix：部分内核会整句丢弃 background */
        .stApp {
            background: linear-gradient(to bottom right, rgba(212, 88, 108, 0.07), transparent 42%),
                #141414 !important;
            color: #eaeaea !important;
        }
        [data-testid="stAppViewContainer"] {
            background: transparent !important;
            color: #eaeaea !important;
        }

        section.main { position: relative; z-index: 1; }
        section.main::before {
            content: "";
            position: fixed;
            inset: 0;
            background: linear-gradient(to bottom right, rgba(212, 88, 108, 0.05), transparent 45%);
            pointer-events: none;
            z-index: 0;
        }
        [data-testid="stMainBlockContainer"] {
            position: relative !important;
            z-index: 2 !important;
            color: #eaeaea !important;
        }

        section.main > div.block-container,
        [data-testid="stMainBlockContainer"] {
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
        }

        [data-testid="stMainBlockContainer"] [data-testid="stVerticalBlock"] {
            gap: 0.35rem !important;
            row-gap: 0.35rem !important;
        }
        /* 勿给「语言切换」那一行设 min-height:100dvh，否则主分栏被顶到屏幕外，像黑屏 */
        [data-testid="stMainBlockContainer"] [data-testid="stHorizontalBlock"] {
            gap: 0.65rem !important;
            align-items: stretch !important;
        }
        @supports selector(:has(*)) {
            [data-testid="stMainBlockContainer"] [data-testid="stHorizontalBlock"]:has([data-testid="stForm"]) {
                min-height: calc(100dvh - 2.7rem) !important;
            }
            [data-testid="stMainBlockContainer"] [data-testid="stHorizontalBlock"]:has([data-testid="stForm"]) [data-testid="stColumn"],
            [data-testid="stMainBlockContainer"] [data-testid="stHorizontalBlock"]:has([data-testid="stForm"]) [data-testid="column"] {
                min-height: calc(100dvh - 2.7rem) !important;
                display: flex !important;
                align-items: stretch !important;
            }
        }
        [data-testid="stMainBlockContainer"] [data-testid="stElementContainer"] {
            margin-bottom: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
        }

        /*
         * 右栏布局：优先用 :has(stForm)（每个 element-container 里 :last-of-type 都会命中横向块，会误伤语言行）。
         * 不支持 :has 时仅损失右栏 padding，表单仍靠下方 [stForm] 规则可见。
         */
        @supports selector(:has(*)) {
            [data-testid="stMainBlockContainer"] [data-testid="stHorizontalBlock"]:has([data-testid="stForm"]) [data-testid="stColumn"]:last-child,
            [data-testid="stMainBlockContainer"] [data-testid="stHorizontalBlock"]:has([data-testid="stForm"]) [data-testid="column"]:last-child {
                flex-direction: column !important;
                justify-content: center !important;
                box-sizing: border-box !important;
                padding: 2rem !important;
            }
        }
        @media (min-width: 1024px) {
            @supports selector(:has(*)) {
                [data-testid="stMainBlockContainer"] [data-testid="stHorizontalBlock"]:has([data-testid="stForm"]) [data-testid="stColumn"]:last-child,
                [data-testid="stMainBlockContainer"] [data-testid="stHorizontalBlock"]:has([data-testid="stForm"]) [data-testid="column"]:last-child {
                    padding-left: 4rem !important;
                    padding-right: 4rem !important;
                }
            }
        }
        @media (min-width: 1280px) {
            @supports selector(:has(*)) {
                [data-testid="stMainBlockContainer"] [data-testid="stHorizontalBlock"]:has([data-testid="stForm"]) [data-testid="stColumn"]:last-child,
                [data-testid="stMainBlockContainer"] [data-testid="stHorizontalBlock"]:has([data-testid="stForm"]) [data-testid="column"]:last-child {
                    padding-left: 5rem !important;
                    padding-right: 5rem !important;
                }
            }
        }

        [data-testid="stMainBlockContainer"] [data-testid="stCheckbox"] {
            margin: 0.35rem 0 0.5rem !important;
            padding: 0 !important;
        }
        [data-testid="stMainBlockContainer"] [data-testid="stCheckbox"] label {
            font-size: 0.75rem !important;
            color: var(--onl-v0-label-fg) !important;
        }

        [data-testid="stMainBlockContainer"] [data-testid="stForm"] {
            margin-top: 0.35rem !important;
            margin-bottom: 0 !important;
            width: 100% !important;
            max-width: 20rem !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stTextInput {
            margin-bottom: 1.25rem !important;
        }
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stTextInput > label {
            font-size: 11px !important;
            font-weight: 500 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.08em !important;
            color: var(--onl-v0-label-fg) !important;
        }
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stTextInput > div > div > input {
            border: 1px solid var(--onl-v0-input-border) !important;
            background: var(--onl-v0-input-glass) !important;
            -webkit-backdrop-filter: blur(24px) !important;
            backdrop-filter: blur(24px) !important;
            border-radius: var(--onl-v0-radius-xl) !important;
            color: #eaeaea !important;
            min-height: 3rem !important;
            padding: 0 0.75rem 0 2.75rem !important;
            font-size: 0.875rem !important;
            box-shadow: none !important;
            transition: border-color 0.3s ease, background 0.3s ease !important;
        }
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stTextInput > div > div > input:focus {
            border-color: rgba(212, 88, 108, 0.55) !important;
            background: var(--onl-v0-input-focus-bg) !important;
            outline: none !important;
            box-shadow: none !important;
        }
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stTextInput > div > div > input::placeholder {
            color: rgba(148, 148, 148, 0.45) !important;
        }
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stTextInput > div > div {
            position: relative !important;
        }
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stTextInput > div > div::before {
            content: "" !important;
            position: absolute !important;
            left: 0.85rem !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            width: 1rem !important;
            height: 1rem !important;
            opacity: 0.45 !important;
            z-index: 2 !important;
            pointer-events: none !important;
            background-size: contain !important;
            background-repeat: no-repeat !important;
            background-position: center !important;
        }
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] [data-testid="stVerticalBlock"] > div:nth-child(1) .stTextInput > div > div::before {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2398989c' stroke-width='2'%3E%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3C/svg%3E") !important;
        }
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] [data-testid="stVerticalBlock"] > div:nth-child(2) .stTextInput > div > div::before {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2398989c' stroke-width='2'%3E%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'/%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'/%3E%3C/svg%3E") !important;
        }

        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stButton > button[kind="primaryFormSubmit"],
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stButton > button[data-testid="baseButton-primaryFormSubmit"] {
            margin-top: 0.5rem !important;
            border: none !important;
            border-radius: var(--onl-v0-radius-xl) !important;
            background: #d4586c !important;
            color: #fafafa !important;
            min-height: 3rem !important;
            font-size: 0.875rem !important;
            font-weight: 500 !important;
            box-shadow: 0 10px 15px -3px rgba(212, 88, 108, 0.28),
                0 4px 6px -4px rgba(212, 88, 108, 0.18) !important;
            transition: transform 0.15s ease, background 0.3s ease, filter 0.3s ease !important;
        }
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stButton > button[kind="primaryFormSubmit"]:hover,
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stButton > button[data-testid="baseButton-primaryFormSubmit"]:hover {
            background: #c14e61 !important;
            filter: brightness(1.03) !important;
        }
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stButton > button[kind="primaryFormSubmit"]:active,
        [data-testid="stMainBlockContainer"] [data-testid="stForm"] .stButton > button[data-testid="baseButton-primaryFormSubmit"]:active {
            transform: scale(0.98) !important;
        }

        /* 语言切换行：次要按钮在深色底上保持可见 */
        [data-testid="stMainBlockContainer"] button[kind="secondary"],
        [data-testid="stMainBlockContainer"] button[data-testid="baseButton-secondary"] {
            color: #eaeaea !important;
            border-color: rgba(255, 255, 255, 0.22) !important;
            background-color: rgba(255, 255, 255, 0.06) !important;
        }

        /* KPI 卡片点击进展示屏 */
        a.onl-v0-stat-link {
            display: block !important;
            text-decoration: none !important;
            color: inherit !important;
            border-radius: 12px;
        }
        a.onl-v0-stat-link:focus-visible {
            outline: 2px solid rgba(212, 88, 108, 0.6);
            outline-offset: 2px;
        }

        /* 左侧自定义 HTML：强制关键文案颜色 */
        .onl-v0-brand-zh, .onl-v0-stat-num, .onl-v0-quick-title { color: #eaeaea !important; }
        .onl-v0-brand-en { color: #e8a0ad !important; }
        .onl-v0-login-title { color: #eaeaea !important; }
        .onl-v0-login-sub, .onl-v0-brand-sub, .onl-v0-quick-sub, .onl-v0-stat-label,
        .onl-v0-chart-title, .onl-v0-chart-hint, .onl-v0-bar-tick { color: rgba(148, 148, 148, 0.85) !important; }

        </style>
        """,
        unsafe_allow_html=True,
    )

    # ── Stats (KPI live; chart matches v0 StatsPanel hourlyData) ──
    total_tech = int(
        (db.one("SELECT COUNT(*) AS n FROM technicians WHERE is_active=1") or {"n": 0})["n"]
    )
    available_tech = int(
        (
            db.one(
                "SELECT COUNT(*) AS n FROM technicians "
                "WHERE is_active=1 AND status='available'"
            )
            or {"n": 0}
        )["n"]
    )
    # Same series as v0 `stats-panel.tsx` (Recharts mock data)
    _hourly = [
        ("10", 3), ("12", 8), ("14", 12), ("16", 15), ("18", 18),
        ("20", 20), ("22", 17), ("0", 14), ("2", 10), ("4", 5),
    ]
    _y_max = 20
    _chart_h = 100
    _bars = []
    for _h, _c in _hourly:
        _pct = min(100.0, (_c / _y_max) * 100.0)
        _bars.append(
            "<div class='onl-v0-bar-col'>"
            f"<div class='onl-v0-bar' style='height:{_pct:.1f}%'></div>"
            f"<span class='onl-v0-bar-tick'>{_h}</span>"
            "</div>"
        )
    _bars_html = "".join(_bars)
    _users_svg = (
        '<svg class="onl-v0-lucide" viewBox="0 0 24 24" fill="none" '
        'stroke="currentColor" stroke-width="2" aria-hidden="true">'
        "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/>"
        "<circle cx=\"9\" cy=\"7\" r=\"4\"/>"
        "<path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/>"
        "<path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/>"
        "</svg>"
    )
    _usercheck_svg = (
        '<svg class="onl-v0-lucide" viewBox="0 0 24 24" fill="none" '
        'stroke="currentColor" stroke-width="2" aria-hidden="true">'
        "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/>"
        "<circle cx=\"9\" cy=\"7\" r=\"4\"/>"
        "<polyline points=\"16 11 18 13 22 9\"/>"
        "</svg>"
    )
    _clip_svg = (
        '<svg class="onl-v0-lucide" viewBox="0 0 24 24" fill="none" '
        'stroke="currentColor" stroke-width="2" aria-hidden="true">'
        "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\"/>"
        "<path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/>"
        "<path d=\"M12 11h4\"/><path d=\"M12 16h4\"/><path d=\"M8 11h.01\"/>"
        "<path d=\"M8 16h.01\"/>"
        "</svg>"
    )

    # ── Language row (top-right) ─────────────────────────────
    lang = get_lang()
    _lrow_l, _lrow_r = st.columns([9, 1])
    with _lrow_r:
        other = "en" if lang == "zh" else "zh"
        st.button(
            LANG_LABELS[other],
            key="_login_lang_toggle",
            use_container_width=True,
            on_click=toggle_lang_session,
        )

    # ── Main split (v0 page: lg ~60% left) ────────────────────
    left_col, div_col, right_col = st.columns([1.32, 0.02, 0.66], gap="small")

    # ─── LEFT: BrandingSection + StatsPanel (flex, items-end) ─
    with left_col:
        _uri = _logo_data_uri(LOGO_PATH)
        if _uri:
            _logo_html = (
                f'<img class="onl-v0-logo-img" src="{_uri}" alt="" '
                'loading="lazy" decoding="async" />'
            )
        else:
            _logo_html = '<div class="onl-v0-logo-fallback" aria-hidden="true">🌹</div>'

        st.markdown(
            f"""
            <div class="onl-left">
              <div class="onl-v0-row">
                <div class="onl-v0-brand">
                  <div class="onl-v0-logo-wrap">
                    <div class="onl-v0-logo-glow" aria-hidden="true"></div>
                    <div class="onl-v0-logo-frame">
                      {_logo_html}
                    </div>
                  </div>
                  <h1 class="onl-v0-brand-zh">{escape(t("login_brand_zh"))}</h1>
                  <p class="onl-v0-brand-en">{escape(t("login_brand_en"))}</p>
                  <p class="onl-v0-brand-sub">{escape(t("login_brand_sub"))}</p>
                  <a class="onl-v0-quick" href="/Technician_Wall?filter=all" target="_self">
                    <div class="onl-v0-quick-inner">
                      <div class="onl-v0-quick-icon">{_clip_svg}</div>
                      <div>
                        <p class="onl-v0-quick-title">{escape(t("login_wall_btn"))}</p>
                        <p class="onl-v0-quick-sub">{escape(t("login_wall_sub"))}</p>
                      </div>
                    </div>
                  </a>
                </div>
                <div class="onl-v0-stats">
                  <div class="onl-v0-stat-grid">
                    <a class="onl-v0-stat-link" href="/Technician_Wall?filter=all" target="_self" title="{escape(t("login_stat_total"))}">
                      <div class="onl-v0-glass onl-v0-stat-card">
                        <div class="onl-v0-stat-head">
                          <div class="onl-v0-icon-box">{_users_svg}</div>
                          <span class="onl-v0-stat-label">{escape(t("login_stat_total"))}</span>
                        </div>
                        <span class="onl-v0-stat-num">{total_tech}</span>
                      </div>
                    </a>
                    <a class="onl-v0-stat-link" href="/Technician_Wall?filter=available" target="_self" title="{escape(t("login_stat_available"))}">
                      <div class="onl-v0-glass onl-v0-stat-card">
                        <div class="onl-v0-stat-head">
                          <div class="onl-v0-icon-box">{_usercheck_svg}</div>
                          <span class="onl-v0-stat-label">{escape(t("login_stat_available"))}</span>
                        </div>
                        <span class="onl-v0-stat-num">{available_tech}</span>
                      </div>
                    </a>
                  </div>
                  <div class="onl-v0-glass onl-v0-chart-card">
                    <h3 class="onl-v0-chart-title">{escape(t("login_chart_title"))}</h3>
                    <p class="onl-v0-chart-hint">{escape(t("login_chart_hint"))}</p>
                    <div class="onl-v0-chart-y">
                      <span>20</span><span>10</span><span>0</span>
                    </div>
                    <div class="onl-v0-chart-plot" style="height:{_chart_h}px">
                      <div class="onl-v0-chart-grid"></div>
                      <div class="onl-v0-bars">{_bars_html}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with div_col:
        st.markdown("<div class='onl-v-divider'></div>", unsafe_allow_html=True)

    # ─── RIGHT: login card ───────────────────────────────────
    with right_col:
        st.markdown(
            f"""
            <div class="onl-v0-login-head">
              <h2 class="onl-v0-login-title">{escape(t("login_welcome_short"))}</h2>
              <p class="onl-v0-login-sub">{escape(t("login_enter_credentials"))}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )
        with st.form("login_form", clear_on_submit=False):
            uname = st.text_input(
                t("username"),
                placeholder=t("login_ph_username"),
                value="admin",
            )
            pwd = st.text_input(
                t("password"),
                type="password",
                placeholder=t("login_ph_password"),
            )
            submitted = st.form_submit_button(
                t("login_btn"), use_container_width=True, type="primary"
            )

        if submitted:
            if not uname.strip() or not pwd.strip():
                st.error(t("login_error_empty"))
            elif login(uname.strip(), pwd, db):
                st.rerun()
            else:
                st.error(t("login_fail"))

    st.caption(f"Ocean Noir VMS · v{APP_VERSION}")

# ============================================================
# LOGGED IN — dashboard
# ============================================================
else:
    render_sidebar("Home")

    bd = current_business_day()

    st.markdown(
        f"<div class='on-page-title'>🌹 {t('home_title')}</div>"
        f"<div class='on-page-sub'>"
        f"{t('home_bd')}：{bd.strftime('%Y年%m月%d日')}"
        f"&ensp;—&ensp;{t('welcome')}，{user.display_name}"
        f"</div>",
        unsafe_allow_html=True,
    )

    st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

    cards = []
    if user.can_operate:
        cards.append(
            ("🏮", t("nav_reception"), "开单 · 充值 · 查询",
             "pages/Reception.py", "go_reception")
        )
    cards.append(
        ("💃", t("nav_tech_wall"), "技师状态 · 队列",
         "pages/Technician_Wall.py", "go_wall")
    )
    if user.role in ("ADMIN", "MANAGER"):
        cards.append(
            ("📊", t("nav_admin"), "报表 · 会员 · 账号",
             "pages/Boss_Center.py", "go_admin")
        )

    cols = st.columns(len(cards)) if cards else []
    for col, (icon, title, subtitle, path, key) in zip(cols, cards):
        with col:
            st.markdown(
                f"<div class='on-card on-card-accent' style='text-align:center;"
                f"cursor:pointer;padding:1.8rem 1rem;'>"
                f"<div style='font-size:2.4rem;margin-bottom:.6rem;'>{icon}</div>"
                f"<div style='font-size:1.1rem;font-weight:700;"
                f"margin-bottom:.3rem;'>{title}</div>"
                f"<div style='color:#a89888;font-size:.82rem;'>{subtitle}</div>"
                f"</div>",
                unsafe_allow_html=True,
            )
            if st.button(
                f"进入{title}", key=key,
                use_container_width=True, type="primary",
            ):
                st.switch_page(path)
