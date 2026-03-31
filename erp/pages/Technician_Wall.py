"""
Technician_Wall.py  —  Kiosk-style technician display.

Modes
─────
  grid   : 3-per-page card grid  (default)
  detail : single-tech 6-photo album
  slides : screensaver — pure-CSS right-to-left marquee (no rerun)

Controls
────────
  • Left-top fixed button      → return to Home (always visible)
  • Click card photo area      → enter detail mode
  • Detail "← 返回列表" button → back to grid
  • Any interaction resets the 90-second idle timer
  • Auto-fullscreen on load via injected JS (best-effort)
"""
from __future__ import annotations

import base64
import mimetypes
import time
from pathlib import Path

import streamlit as st

from core.config import TECH_UPLOAD_DIR
from core.database import db, init_db, cents_to_display
from core.i18n import t
from core.ui import inject_css
from logic.queue import get_all_active

st.set_page_config(
    page_title="技师展示",
    page_icon="💃",
    layout="wide",
    initial_sidebar_state="collapsed",
)

init_db()
inject_css()

# ── Constants ───────────────────────────────────────────────────────────────
COLS = 3          # 每页 3 人（一行）
PER_PAGE = COLS   # 每页只显示一行 3 人
IDLE_SECS = 90    # 无操作后进入跑马灯（秒）
MAX_PHOTOS = 6    # 每位技师最多展示照片数
# Marquee speed: base seconds per card width; total = N_cards × this
_SECS_PER_CARD = 5   # 每张卡片大约 5 秒飞过，总时长由技师数量动态算

# ── Helper paths ─────────────────────────────────────────────────────────────
_placeholder_path = (
    Path(__file__).parent.parent / "assets" / "images" / "placeholder.png"
)
if not _placeholder_path.exists():
    try:
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (200, 280), color="#1a1a1a")
        draw = ImageDraw.Draw(img)
        draw.ellipse([60, 30, 140, 110], fill="#c0394b")
        draw.rectangle([40, 120, 160, 280], fill="#c0394b")
        img.save(str(_placeholder_path))
    except Exception:
        pass


def _resolve(stored: str | None) -> Path | None:
    if not stored or not str(stored).strip():
        return None
    p = Path(stored)
    if p.is_file():
        return p
    p2 = TECH_UPLOAD_DIR / stored
    if p2.is_file():
        return p2
    return None


def _img_b64(path: Path) -> str:
    """Return data-URI for inline <img>."""
    try:
        mime = mimetypes.guess_type(path.name)[0] or "image/jpeg"
        return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"
    except OSError:
        return ""


def _placeholder_b64() -> str:
    if _placeholder_path.exists():
        return _img_b64(_placeholder_path)
    return ""


# ── Data layer ───────────────────────────────────────────────────────────────
def _all_for_wall() -> list[dict]:
    rows = db.all(
        """
        SELECT t.id, t.code, t.display_name, t.status, t.last_queue_ts,
               t.price_cents, t.specialty, t.languages, t.bio,
               t.nationality, t.age, t.bust, t.weight_kg, t.height_cm,
               COALESCE(
                 NULLIF(TRIM(t.photo_path), ''),
                 (SELECT m.relative_path FROM technician_media m
                  WHERE m.technician_id = t.id AND m.kind = 'image'
                  ORDER BY m.sort_order, m.id LIMIT 1)
               ) AS photo_path
        FROM technicians t
        WHERE t.is_active = 1 ORDER BY t.code ASC
        """
    )
    return [dict(r) for r in rows]


def _media_paths(tech_id: int) -> list[Path]:
    """Return up to MAX_PHOTOS resolved image paths for a tech."""
    rows = db.all(
        """
        SELECT relative_path FROM technician_media
        WHERE technician_id = ? AND kind = 'image'
        ORDER BY sort_order, id LIMIT ?
        """,
        (tech_id, MAX_PHOTOS),
    )
    paths: list[Path] = []
    for r in rows:
        p = _resolve(r["relative_path"])
        if p:
            paths.append(p)
    return paths


def _queue_map(all_active: list[dict]) -> dict[int, int]:
    pos = 1
    qm: dict[int, int] = {}
    for row in sorted(all_active, key=lambda r: (r.get("last_queue_ts") or "9999")):
        if row["status"] == "available":
            qm[row["id"]] = pos
            pos += 1
    return qm


# ── Session state init ───────────────────────────────────────────────────────
def _touch() -> None:
    """Record last interaction time (resets idle timer)."""
    st.session_state["_wall_last_touch"] = time.time()


st.session_state.setdefault("wall_mode", "grid")   # grid | detail | slides
st.session_state.setdefault("wall_page", 1)
st.session_state.setdefault("wall_detail_id", None)
st.session_state.setdefault("wall_photo_idx", 0)
st.session_state.setdefault("_wall_last_touch", time.time())
st.session_state.setdefault("wall_filter", "all")  # all | available

# ── Marquee click: detect ?tw_tid=<id> set by the pure-HTML anchor ────────────
_tw_tid = st.query_params.get("tw_tid")
if _tw_tid:
    try:
        _tid_int = int(_tw_tid)
        st.query_params.clear()
        st.session_state["wall_mode"] = "detail"
        st.session_state["wall_detail_id"] = _tid_int
        st.session_state["wall_photo_idx"] = 0
        st.session_state["_wall_last_touch"] = time.time()
        st.rerun()
    except (ValueError, TypeError):
        st.query_params.clear()

# ── Home 登录页 KPI / 快捷链接：?filter=all | ?filter=available ───────────────
if "filter" in st.query_params:
    _fv = st.query_params.get("filter")
    if isinstance(_fv, list):
        _fv = _fv[0] if _fv else ""
    _fv = (str(_fv) if _fv is not None else "").lower()
    if _fv in ("all", "available"):
        st.session_state["wall_filter"] = _fv
        st.session_state["wall_page"] = 1
        st.session_state["wall_mode"] = "grid"
    try:
        st.query_params.pop("filter", None)
    except (TypeError, AttributeError, KeyError):
        try:
            del st.query_params["filter"]
        except Exception:
            pass
    st.rerun()

# ── Page-level CSS + JS ──────────────────────────────────────────────────────
st.markdown(
    """
    <style>
    /* Kiosk overrides */
    [data-testid="stSidebar"]        { display: none !important; }
    [data-testid="collapsedControl"] { display: none !important; }
    header[data-testid="stHeader"]   { display: none !important; }

    section.main > div.block-container,
    [data-testid="stMainBlockContainer"] {
        padding: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
    }
    [data-testid="stMainBlockContainer"] [data-testid="stVerticalBlock"] {
        gap: 0 !important;
    }
    [data-testid="stMainBlockContainer"] [data-testid="stElementContainer"] {
        margin-bottom: 0 !important;
        padding: 0 !important;
    }
    </style>

    <script>
    /* Auto-fullscreen on load (fires once; browser may require prior gesture) */
    (function attemptFullscreen() {
        var el = document.documentElement;
        if (!document.fullscreenElement) {
            if (el.requestFullscreen)           el.requestFullscreen();
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            else if (el.mozRequestFullScreen)    el.mozRequestFullScreen();
        }
    })();
    </script>
    """,
    unsafe_allow_html=True,
)

# ── Fixed home button (always on top-left) ───────────────────────────────────
st.markdown(
    """
    <div id="tw-home-btn-placeholder" style="height:0;overflow:visible;position:relative;z-index:9999;">
    </div>
    """,
    unsafe_allow_html=True,
)
_home_col, _ = st.columns([1, 11])
with _home_col:
    if st.button(
        t("tech_wall_back_home"),
        key="_tw_home",
        use_container_width=True,
        type="secondary",
    ):
        _touch()
        st.session_state["wall_mode"] = "grid"
        st.session_state["wall_filter"] = "all"
        st.switch_page("Home.py")

# ── Helpers ───────────────────────────────────────────────────────────────────
STATUS_BADGE = {
    "available": ("🟢", "tech_available"),
    "busy":      ("🔴", "tech_busy"),
    "offline":   ("⚫", "tech_offline"),
    "paused":    ("🟡", "tech_paused"),
}

ORDER_PRI = {"available": 0, "paused": 1, "busy": 2, "offline": 3}


def _status_html(tech: dict, q_pos: int | None) -> str:
    icon, key = STATUS_BADGE.get(tech["status"], ("", "tech_offline"))
    badge = f"{icon} {t(key)}"
    if q_pos:
        badge += f" &nbsp;·&nbsp; <span class='tw-queue'>{t('tech_wall_queue_pos', n=q_pos)}</span>"
    return f"<div class='tw-status'>{badge}</div>"


def _cover_uri(tech: dict) -> str:
    p = _resolve(tech.get("photo_path"))
    if p:
        return _img_b64(p)
    return _placeholder_b64()


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  MODE: DETAIL                                                           ║
# ╚══════════════════════════════════════════════════════════════════════════╝
def _render_detail() -> None:
    tech_id = st.session_state.get("wall_detail_id")
    all_techs = _all_for_wall()
    tech = next((r for r in all_techs if r["id"] == tech_id), None)
    if not tech:
        st.session_state["wall_mode"] = "grid"
        st.rerun()
        return

    photos = _media_paths(tech_id)
    if not photos:
        cover_p = _resolve(tech.get("photo_path"))
        if cover_p:
            photos = [cover_p]
    if not photos and _placeholder_path.exists():
        photos = [_placeholder_path]

    idx = int(st.session_state.get("wall_photo_idx", 0))
    idx = max(0, min(idx, len(photos) - 1))

    # ── Back button ──────────────────────────────────────────────────────────
    back_col, _ = st.columns([2, 10])
    with back_col:
        if st.button(t("tech_wall_close_detail"), key="_tw_back_detail"):
            _touch()
            st.session_state["wall_mode"] = "grid"
            st.session_state["wall_photo_idx"] = 0
            st.rerun()

    # ── Layout: big photo left, info + thumbnails right ──────────────────────
    left, right = st.columns([3, 2], gap="large")

    with left:
        if photos:
            st.markdown(
                f"<div class='tw-detail-main-wrap'>"
                f"<img class='tw-detail-main-img' src='{_img_b64(photos[idx])}' />"
                f"<div class='tw-photo-counter'>"
                f"{t('tech_wall_photo_of', cur=idx+1, total=len(photos))}"
                f"</div>"
                f"</div>",
                unsafe_allow_html=True,
            )
        # Thumbnails row
        if len(photos) > 1:
            thumb_cols = st.columns(len(photos))
            for i, (tc, pp) in enumerate(zip(thumb_cols, photos)):
                with tc:
                    border_style = (
                        "border:2px solid #d4a843;" if i == idx
                        else "border:2px solid transparent;"
                    )
                    st.markdown(
                        f"<div style='{border_style}border-radius:6px;overflow:hidden;"
                        f"cursor:pointer;'>",
                        unsafe_allow_html=True,
                    )
                    if st.button("", key=f"_tw_thumb_{i}", use_container_width=True):
                        _touch()
                        st.session_state["wall_photo_idx"] = i
                        st.rerun()
                    st.markdown(
                        f"<img src='{_img_b64(pp)}' "
                        f"style='width:100%;height:70px;object-fit:cover;display:block;'/>",
                        unsafe_allow_html=True,
                    )
                    st.markdown("</div>", unsafe_allow_html=True)
        # Prev / Next
        if len(photos) > 1:
            p_col, n_col = st.columns(2)
            with p_col:
                if st.button("◀", key="_tw_photo_prev", disabled=idx == 0,
                             use_container_width=True):
                    _touch()
                    st.session_state["wall_photo_idx"] = idx - 1
                    st.rerun()
            with n_col:
                if st.button("▶", key="_tw_photo_next",
                             disabled=idx >= len(photos) - 1,
                             use_container_width=True):
                    _touch()
                    st.session_state["wall_photo_idx"] = idx + 1
                    st.rerun()

    with right:
        active_all = get_all_active(db)
        qm = _queue_map(active_all)
        q_pos = qm.get(tech["id"])
        icon, key = STATUS_BADGE.get(tech["status"], ("", "tech_offline"))
        _q_html = (
            f" &nbsp;·&nbsp; <span class='tw-queue'>#{q_pos} 排队</span>"
            if q_pos else ""
        )
        st.markdown(
            f"""
            <div class='tw-detail-info'>
              <div class='tw-detail-name'>{tech['display_name']}</div>
              <div class='tw-detail-code'>{tech['code']}</div>
              <div class='tw-detail-status'>{icon} {t(key)}{_q_html}</div>
              <hr class='tw-hr'>
            """,
            unsafe_allow_html=True,
        )
        items = []
        if tech.get("specialty"):
            items.append(("✨ 专长", tech["specialty"]))
        if tech.get("nationality"):
            items.append(("🌏 国籍", tech["nationality"]))
        if tech.get("age"):
            items.append(("🎂 年龄", str(tech["age"])))
        if tech.get("height_cm"):
            items.append(("📏 身高", f"{tech['height_cm']} cm"))
        if tech.get("weight_kg"):
            items.append(("⚖️ 体重", f"{tech['weight_kg']} kg"))
        if tech.get("bust"):
            items.append(("💎 三围", tech["bust"]))
        if tech.get("languages"):
            items.append(("💬 语言", tech["languages"]))
        if tech.get("price_cents"):
            items.append(("💵 起步价", cents_to_display(tech["price_cents"])))

        rows_html = "".join(
            f"<div class='tw-detail-row'><span class='tw-detail-label'>{lbl}</span>"
            f"<span class='tw-detail-val'>{val}</span></div>"
            for lbl, val in items
        )
        if tech.get("bio"):
            bio_html = (
                f"<div class='tw-detail-bio'>{tech['bio']}</div>"
            )
        else:
            bio_html = ""
        st.markdown(
            f"{rows_html}{bio_html}</div>",
            unsafe_allow_html=True,
        )


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  MODE: SLIDES  —  pure-CSS right-to-left marquee                        ║
# ╚══════════════════════════════════════════════════════════════════════════╝
def _render_slides(techs_sorted: list[dict], qm: dict[int, int]) -> None:
    """
    Pure-HTML marquee screensaver.

    All cards are rendered as real <div> elements inside a CSS-animated track,
    so the animation is guaranteed to work regardless of Streamlit's DOM structure.

    Click mechanism:
      Each card is an <a href="?tw_tid=ID"> link.  At page-top we read
      st.query_params["tw_tid"] and jump to detail mode before rendering.
      This avoids st.components.v1.html (can't return values) and avoids
      st.markdown <script> stripping (Streamlit ≥1.37 sanitises JS).
    """
    from html import escape as _esc

    n = max(len(techs_sorted), 1)
    dur = max(20, n * _SECS_PER_CARD)

    # Build one card's HTML
    def _card(tech: dict) -> str:
        uri = _cover_uri(tech)
        name = _esc(tech["display_name"])
        code = _esc(tech.get("code") or "")
        tid = tech["id"]
        return (
            f'<a class="mq-card" href="?tw_tid={tid}" '
            f'   aria-label="{name}" style="text-decoration:none;">'
            f'  <div class="mq-photo-wrap">'
            f'    <img src="{uri}" alt="{name}" />'
            f'  </div>'
            f'  <div class="mq-card-name">{name}</div>'
            f'  <div class="mq-card-code">{code}</div>'
            f'</a>'
        )

    # Duplicate list for seamless loop
    cards_html = "".join(_card(t) for t in techs_sorted * 2)

    st.markdown(
        f"""
        <style>
        /* ── marquee container ── */
        #mq-outer {{
            overflow: hidden;
            width: 100vw;
            background: #0a0a0a;
            /* fill remaining viewport below the fixed home button */
            height: calc(100dvh - 3rem);
            display: flex;
            align-items: center;
        }}
        #mq-track {{
            display: flex;
            flex-wrap: nowrap;
            gap: 1rem;
            animation: mqSlide {dur}s linear infinite;
            /* paused on hover (desktop) */
        }}
        #mq-track:hover {{
            animation-play-state: paused;
        }}
        /* click (touch) pauses too — JS toggles the class */
        #mq-track.mq-paused {{
            animation-play-state: paused !important;
        }}
        @keyframes mqSlide {{
            from {{ transform: translateX(0); }}
            to   {{ transform: translateX(-50%); }}
        }}
        /* ── each card ── */
        .mq-card {{
            flex: 0 0 calc(100vw / 3.3);
            display: flex;
            flex-direction: column;
            background: #1a1a1a;
            border: 1px solid #3a2a2a;
            border-radius: 14px;
            overflow: hidden;
            cursor: pointer;
        }}
        .mq-photo-wrap {{
            width: 100%;
            aspect-ratio: 3 / 4;
            max-height: 72dvh;
            overflow: hidden;
            background: #111;
        }}
        .mq-photo-wrap img {{
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }}
        .mq-card-name {{
            font-size: 1.1rem;
            font-weight: 700;
            color: #f8f0e8;
            text-align: center;
            padding: 0.55rem 0.75rem 0.2rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }}
        .mq-card-code {{
            font-size: 0.72rem;
            color: #8a7a6a;
            text-align: center;
            letter-spacing: 0.04em;
            padding: 0 0.75rem 0.6rem;
        }}
        </style>

        <div id="mq-outer">
          <div id="mq-track">
            {cards_html}
          </div>
        </div>

        <script>
        /* Tap/click pauses the track in place */
        (function() {{
          var track = document.getElementById('mq-track');
          if (!track) return;
          track.addEventListener('click', function(e) {{
            e.stopPropagation();
            track.classList.add('mq-paused');
          }}, {{ once: false }});
        }})();
        </script>
        """,
        unsafe_allow_html=True,
    )


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  MODE: GRID                                                              ║
# ╚══════════════════════════════════════════════════════════════════════════╝
def _render_grid_or_slides() -> None:
    all_techs = _all_for_wall()
    active_all = get_all_active(db)
    qm = _queue_map(active_all)

    _flt = st.session_state.get("wall_filter", "all")
    if _flt == "available":
        view_rows = [r for r in all_techs if r.get("status") == "available"]
    else:
        view_rows = all_techs

    techs_sorted = sorted(
        view_rows,
        key=lambda r: (ORDER_PRI.get(r["status"], 9), r.get("code", "")),
    )
    total = len(techs_sorted)
    total_pages = max(1, (total + PER_PAGE - 1) // PER_PAGE)

    if _flt == "available":
        st.caption(t("tech_wall_filter_avail"))

    if total == 0:
        st.info(t("no_records"))
        return

    # ── Idle → slides transition ───────────────────────────────────────────
    now = time.time()
    idle = now - float(st.session_state.get("_wall_last_touch", now))
    in_slides = st.session_state["wall_mode"] == "slides"

    if idle >= IDLE_SECS and not in_slides:
        st.session_state["wall_mode"] = "slides"
        in_slides = True

    if in_slides:
        _render_slides(techs_sorted, qm)
        return

    # ── GRID mode ─────────────────────────────────────────────────────────
    page = int(st.session_state.get("wall_page", 1))
    page = max(1, min(page, total_pages))
    st.session_state["wall_page"] = page
    start = (page - 1) * PER_PAGE
    page_slice = techs_sorted[start: start + PER_PAGE]

    # Header
    hdr_left, hdr_right = st.columns([6, 2])
    with hdr_left:
        st.markdown(
            f"<div class='tw-page-info'>"
            f"{t('tech_wall_page_info', cur=page, total=total_pages, n=total)}"
            f"</div>",
            unsafe_allow_html=True,
        )
    with hdr_right:
        prev_c, next_c = st.columns(2)
        with prev_c:
            if st.button(
                f"◀ {t('tech_wall_page_prev')}",
                key="wall_prev",
                disabled=page <= 1,
                use_container_width=True,
            ):
                _touch()
                st.session_state["wall_page"] = page - 1
                st.rerun()
        with next_c:
            if st.button(
                f"{t('tech_wall_page_next')} ▶",
                key="wall_next",
                disabled=page >= total_pages,
                use_container_width=True,
            ):
                _touch()
                st.session_state["wall_page"] = page + 1
                st.rerun()

    st.markdown("<div style='height:.5rem'></div>", unsafe_allow_html=True)

    # Card row — each card gets a transparent overlay button on the photo
    cols = st.columns(COLS, gap="medium")
    for col, tech in zip(cols, page_slice):
        with col:
            cover_uri = _cover_uri(tech)

            # Photo wrap: HTML card shell, then Streamlit button inside the wrap
            st.markdown(
                f"""
                <div class='tw-card'>
                  <div class='tw-card-photo-wrap' id='tw-wrap-{tech["id"]}'>
                    <img class='tw-card-photo' src='{cover_uri}' />
                """,
                unsafe_allow_html=True,
            )
            # Transparent full-cover button — clicking the photo triggers this
            if st.button(
                "",
                key=f"_tw_detail_{tech['id']}",
                use_container_width=True,
                help=t("tech_wall_view_photos"),
            ):
                _touch()
                st.session_state["wall_mode"] = "detail"
                st.session_state["wall_detail_id"] = tech["id"]
                st.session_state["wall_photo_idx"] = 0
                st.rerun()
            # Card body: name + code only
            st.markdown(
                f"""
                  </div>
                  <div class='tw-card-body'>
                    <div class='tw-card-name'>{tech['display_name']}</div>
                    <div class='tw-card-code'>{tech['code']}</div>
                  </div>
                </div>
                """,
                unsafe_allow_html=True,
            )


# ── Fragment wrapper (60 s data refresh in grid/slides mode) ─────────────────
@st.fragment(run_every=60)
def _wall_fragment() -> None:
    mode = st.session_state.get("wall_mode", "grid")
    if mode == "detail":
        _render_detail()
    else:
        _render_grid_or_slides()


_wall_fragment()
