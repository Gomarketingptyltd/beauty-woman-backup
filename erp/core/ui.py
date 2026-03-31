"""
UI bootstrapper — injects CSS, renders sidebar nav, handles language toggle.
"""
from __future__ import annotations

from pathlib import Path

import streamlit as st

from core.auth import current_user, logout
from core.config import APP_VERSION, CSS_PATH, LOGO_PATH
from core.i18n import LANG_LABELS, get_lang, toggle_lang_session, t

# Nav icon map
_NAV_ICONS = {
    "Home":            "🏠",
    "Reception":       "🏮",
    "Technician_Wall": "💃",
    "Boss_Center":     "📊",
}

_NAV_PAGES = [
    ("nav_home",       "Home",            "Home.py"),
    ("nav_reception",  "Reception",       "pages/Reception.py"),
    ("nav_tech_wall",  "Technician_Wall", "pages/Technician_Wall.py"),
    ("nav_admin",      "Boss_Center",     "pages/Boss_Center.py"),
]


# ---------------------------------------------------------------------------
# CSS injection
# ---------------------------------------------------------------------------

def inject_css() -> None:
    if CSS_PATH.exists():
        css = CSS_PATH.read_text(encoding="utf-8")
        st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------

def render_sidebar(current_page: str = "") -> None:
    inject_css()

    with st.sidebar:
        # Logo
        if LOGO_PATH.exists():
            st.image(str(LOGO_PATH), use_container_width=True)
        else:
            st.markdown(
                "<h2 style='color:#c0394b;text-align:center;'>夜色宫</h2>",
                unsafe_allow_html=True,
            )

        st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

        # Navigation
        _nav(current_page)

        st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

        # Language toggle
        lang = get_lang()
        other_lang = "en" if lang == "zh" else "zh"
        st.button(
            LANG_LABELS[other_lang],
            key="_lang_toggle",
            use_container_width=True,
            on_click=toggle_lang_session,
        )

        st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

        # Current user & logout
        user = current_user()
        if user:
            st.markdown(
                f"<small style='color:#a89888'>{t('logged_in_as')}：<br>"
                f"<b style='color:#f8f0e8'>{user.display_name}</b>"
                f"&ensp;<span style='color:#c0394b'>({user.role_label_zh})</span></small>",
                unsafe_allow_html=True,
            )
            if st.button(t("logout"), key="_logout_btn", use_container_width=True):
                logout()
                st.rerun()
        else:
            st.markdown(
                f"<small style='color:#6a5a4a'>{t('login')}</small>",
                unsafe_allow_html=True,
            )

        st.caption(f"ON-VMS v{APP_VERSION}")


def _nav(current_page: str) -> None:
    """Render sidebar navigation with visual active state."""
    user = current_user()

    visibility = {
        "Home":            True,
        "Reception":       bool(user and user.can_operate),
        "Technician_Wall": True,
        "Boss_Center":     bool(user and user.role in ("ADMIN", "MANAGER")),
    }

    for key, page_name, target_path in _NAV_PAGES:
        if not visibility.get(page_name, False):
            continue

        icon = _NAV_ICONS.get(page_name, "")
        label = f"{icon} {t(key)}"
        is_active = current_page == page_name

        # Inject active highlight via a wrapper div — one per button
        active_css = (
            "background:rgba(192,57,75,0.18);border-left:3px solid #c0394b;"
            "border-radius:8px;margin-bottom:2px;"
            if is_active else
            "margin-bottom:2px;"
        )
        st.markdown(f"<div style='{active_css}'>", unsafe_allow_html=True)
        if st.button(label, key=f"_nav_{page_name}", use_container_width=True):
            st.switch_page(target_path)
        st.markdown("</div>", unsafe_allow_html=True)


def back_button(
    label: str | None = None,
    target: str = "Home.py",
    use_container_width: bool = False,
    *,
    key: str | None = None,
) -> None:
    """Small '← 首页' / back control. Uses switch_page (stable across Streamlit versions)."""
    btn_label = label or f"← {t('back')}"
    # Unique key per call site — avoids multipage widget-id clashes (dots in paths are avoided).
    btn_key = key or f"_back_{target.replace('.', '_')}"
    if st.button(
        btn_label,
        key=btn_key,
        use_container_width=use_container_width,
        type="secondary",
    ):
        st.switch_page(target)
