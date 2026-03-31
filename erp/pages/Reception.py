"""
Reception.py — Front-desk: new orders, technician list, member management.
"""
from __future__ import annotations

import html
import re
from datetime import date as _date
from datetime import datetime, timezone

import pandas as pd
import streamlit as st

from core.auth import require_operational
from core.business_day import current_business_day
from core.config import (
    PAYMENT_CASH, PAYMENT_MEMBER,
)
from core.database import db, init_db, cents_to_display, dollars_to_cents, next_member_code
from core.i18n import t
from core.security import apply_member_pii
from core.ui import render_sidebar, back_button
from logic.billing import OrderLine, create_order, topup_member
from logic.tech_media import (
    MAX_TECH_MEDIA,
    count_tech_media,
    delete_media_row,
    list_tech_media,
    save_uploaded_media,
    abs_path,
)
from logic.queue import (
    checkin_tech,
    checkout_tech,
    get_all_active,
    next_rotation_tech,
    pause_tech,
    resume_tech,
)

# ---------------------------------------------------------------------------
# Service Presets — 固定套餐配置（不入数据库）
# ---------------------------------------------------------------------------
SERVICE_PRESETS = [
    {
        "name": "丝路·水床",
        "desc": "经典湿蒸 + 海盐 + 鲜奶 + 水床滑推 + 大床",
        "options": [("60 Mins", 458), ("90 Mins", 638)],
    },
    {
        "name": "黑金·全能王",
        "desc": "水床 + 性爱椅 + 顶级大床",
        "options": [("60 Mins", 558), ("90 Mins", 788)],
    },
    {
        "name": "精致快乐",
        "desc": "梦幻舞台、性爱椅、特定主题空间",
        "options": [("30 Mins", 190), ("45 Mins", 260)],
    },
    {
        "name": "浮生浴缸",
        "desc": "超大按摩浴缸、泡沫交互",
        "options": [("60 Mins", 488), ("90 Mins", 688)],
    },
    {
        "name": "极境湿蒸",
        "desc": "房内独立小湿蒸、深度排毒",
        "options": [("45 Mins", 328), ("60 Mins", 428)],
    },
]

st.set_page_config(
    page_title="前台开单",
    page_icon="🏮",
    layout="wide",
    initial_sidebar_state="expanded",
)

user = require_operational()
init_db()  # 保证 technician_media 等新表已创建

if "reception_selected_room_id" not in st.session_state:
    st.session_state["reception_selected_room_id"] = None

# 套餐快选：记录当前选中套餐的填充值（name, price_aud）
if "_preset_fill" not in st.session_state:
    st.session_state["_preset_fill"] = None  # None | {"name": str, "price": int}

render_sidebar("Reception")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

ROOM_GRID_COLS = 5  # 15 间服务房：3 排 × 5 列


def _rooms_for_order_grid() -> list[dict]:
    """仅服务间（S01–S15），不含公共区 PUB、等候区 W01–W03。状态决定卡片颜色。"""
    return db.all(
        "SELECT id, code, room_type, status FROM rooms "
        "WHERE room_type = 'service' ORDER BY code"
    )


_DUR_RE = re.compile(r"\b(\d+)\s*Mins?\b", re.IGNORECASE)


def _room_service_info(room_id: int) -> dict | None:
    """
    取该房间最近一笔 paid 订单的服务信息。
    返回 dict 含 order_no, tech_code, tech_name, items_desc, started_at_iso, duration_mins
    如无有效订单返回 None。
    """
    order = db.one(
        """
        SELECT o.id, o.order_no, o.created_at,
               t.code AS tech_code, t.display_name AS tech_name
        FROM orders o
        JOIN technicians t ON o.technician_id = t.id
        WHERE o.room_id = ? AND o.status = 'paid'
        ORDER BY o.id DESC LIMIT 1
        """,
        (room_id,),
    )
    if not order:
        return None
    items = db.all(
        "SELECT description, qty, unit_price_cents FROM order_lines WHERE order_id=?",
        (order["id"],),
    )
    items_desc = "、".join(
        f"{it['description']} ×{it['qty']}" for it in items
    ) if items else "—"

    # 从描述里解析总时长
    total_mins: int | None = None
    for it in items:
        m = _DUR_RE.search(str(it["description"]))
        if m:
            total_mins = int(m.group(1)) * int(it["qty"])
            break

    return {
        "order_no":      order["order_no"],
        "tech_code":     order["tech_code"],
        "tech_name":     order["tech_name"],
        "items_desc":    items_desc,
        "started_at":    order["created_at"],
        "duration_mins": total_mins,
    }


def _busy_service_room_ids() -> set[int]:
    """
    忙碌技师「最新一笔 paid 订单」所绑定的房间。
    当 rooms 表仍为 free 但技师已在服务中时，用此集合与 DB 状态对齐展示与选房逻辑。
    """
    rows = db.all(
        """
        SELECT o.room_id
        FROM orders o
        JOIN technicians t ON o.technician_id = t.id AND t.status = 'busy'
        WHERE o.status = 'paid' AND o.room_id IS NOT NULL
          AND o.id = (
            SELECT MAX(o2.id) FROM orders o2
            WHERE o2.technician_id = o.technician_id AND o2.status = 'paid'
          )
        """
    )
    return {int(r["room_id"]) for r in rows if r.get("room_id") is not None}


def _effective_room_status(db_status: str, room_id: int, busy_rooms: set[int]) -> str:
    """DB 状态与忙碌技师订单交叉校验后的展示用状态。"""
    if room_id in busy_rooms:
        return "occupied"
    return db_status


def _room_is_selectable_free(db_status: str, room_id: int, busy_rooms: set[int]) -> bool:
    """可选作新开单的空房：须为 free 且非忙碌技师占用房。"""
    return db_status == "free" and room_id not in busy_rooms


def _calc_countdown(started_at_iso: str, duration_mins: int | None) -> dict:
    """
    计算倒计时信息。返回 dict:
      elapsed_mins: int  — 已过分钟
      remaining_mins: int | None — 剩余分钟（None 表示未知时长）
      overtime: bool
      label: str         — 用于显示的文字
      color: str         — CSS 颜色
    """
    try:
        started = datetime.fromisoformat(started_at_iso)
        if started.tzinfo is None:
            started = started.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        elapsed = int((now - started).total_seconds() // 60)
    except Exception:
        return {"elapsed_mins": 0, "remaining_mins": None,
                "overtime": False, "label": "—", "color": "#888"}

    if duration_mins is None:
        return {
            "elapsed_mins":   elapsed,
            "remaining_mins": None,
            "overtime":       False,
            "label":          f"已服务 {elapsed} 分钟",
            "color":          "#888",
        }

    remaining = duration_mins - elapsed
    overtime = remaining < 0
    if overtime:
        label = f"⚠️ 超时 {abs(remaining)} 分钟"
        color = "#e05c5c"
    else:
        label = f"剩余 {remaining} 分钟"
        color = "#4caf80"

    return {
        "elapsed_mins":   elapsed,
        "remaining_mins": remaining,
        "overtime":       overtime,
        "label":          label,
        "color":          color,
    }


def _toggle_free_room_click(rid: int) -> None:
    """空闲房间：点选 / 再点取消。同时清除弹窗上下文，防止残留 room/tech/member 弹窗。"""
    cur = st.session_state.get("reception_selected_room_id")
    if cur is not None and int(cur) == int(rid):
        st.session_state["reception_selected_room_id"] = None
    else:
        st.session_state["reception_selected_room_id"] = int(rid)
    # 清除所有弹窗上下文，防止误触发
    st.session_state.pop("_active_room_detail_id", None)
    st.session_state.pop("_active_tech_profile_id", None)
    st.session_state.pop("_active_member_profile_id", None)
    st.session_state.pop("_last_profile_ctx", None)


def _open_room_detail_click(rid: int) -> None:
    """使用中房间：打开详情弹窗。支持 DB 为 free 但忙碌技师订单仍指向该房的情况。"""
    row = db.one("SELECT status FROM rooms WHERE id=?", (int(rid),))
    busy_rooms = _busy_service_room_ids()
    if not row:
        st.session_state.pop("_active_room_detail_id", None)
        st.session_state.pop("_last_profile_ctx", None)
        return
    if str(row["status"]) != "occupied" and int(rid) not in busy_rooms:
        st.session_state.pop("_active_room_detail_id", None)
        st.session_state.pop("_last_profile_ctx", None)
        return
    st.session_state.pop("_active_tech_profile_id", None)
    st.session_state.pop("_active_member_profile_id", None)
    st.session_state["_active_room_detail_id"] = int(rid)
    st.session_state["_last_profile_ctx"] = "room"


def _sync_room_selection() -> int | None:
    """Return selected id only if still free; clear stale selection."""
    sel = st.session_state.get("reception_selected_room_id")
    if sel is None:
        return None
    busy = _busy_service_room_ids()
    row = db.one("SELECT id, status FROM rooms WHERE id=?", (int(sel),))
    if not row or not _room_is_selectable_free(str(row["status"]), int(row["id"]), busy):
        st.session_state["reception_selected_room_id"] = None
        return None
    return int(row["id"])


def _tech_options() -> dict[str, int]:
    rows = get_all_active(db)
    avail = [r for r in rows if r["status"] == "available"]
    return {f"{r['code']} — {r['display_name']}": r["id"] for r in avail}


def _member_search_result(query: str) -> list[dict]:
    if not query.strip():
        return []
    q = f"%{query.strip()}%"
    rows = db.all(
        "SELECT * FROM members WHERE code LIKE ? OR display_name LIKE ? ORDER BY code LIMIT 20",
        (q, q),
    )
    return [apply_member_pii(dict(r), user.role) for r in rows]


def _members_all_rows() -> list[dict]:
    rows = db.all("SELECT * FROM members ORDER BY code")
    return [apply_member_pii(dict(r), user.role) for r in rows]


def _member_rows_to_dataframe(rows: list[dict]) -> pd.DataFrame:
    show_cols = {
        t("member_code"):          "code",
        t("member_name"):          "display_name",
        t("member_tier"):          "tier",
        t("member_principal"):     "principal_cents",
        t("member_reward"):        "reward_cents",
        t("member_phone"):         "phone",
        t("member_contact_other"): "contact_other",
    }
    display_rows: list[dict] = []
    for r in rows:
        row_disp: dict = {}
        for label, key in show_cols.items():
            val = r.get(key, "")
            if key in ("principal_cents", "reward_cents"):
                val = cents_to_display(val)
            elif key == "tier":
                val = t(f"tier_{val}")
            row_disp[label] = str(val or "")
        display_rows.append(row_disp)
    return pd.DataFrame(display_rows)


# ---------------------------------------------------------------------------
# Dialog dismiss：用户点 X / 遮罩 / ESC 关闭时也必须清 session，否则会「下次操作又弹窗」
# （默认 on_dismiss="ignore" 不会清状态也不会 rerun）
# ---------------------------------------------------------------------------
def _on_congrats_member_dismiss() -> None:
    st.session_state.pop("_dlg_member_added", None)


def _on_congrats_tech_dismiss() -> None:
    st.session_state.pop("_dlg_tech_added", None)


def _on_new_member_dismiss() -> None:
    st.session_state.pop("_open_new_member_dlg", None)
    st.session_state.pop("_last_profile_ctx", None)


def _on_room_detail_dismiss() -> None:
    st.session_state.pop("_active_room_detail_id", None)
    st.session_state.pop("_last_profile_ctx", None)


def _on_member_profile_dismiss() -> None:
    st.session_state.pop("_active_member_profile_id", None)
    st.session_state.pop("_last_profile_ctx", None)


def _on_tech_profile_dismiss() -> None:
    tid = st.session_state.get("_active_tech_profile_id")
    if tid is not None:
        st.session_state.pop(f"_tech_media_view_{tid}", None)
        st.session_state.pop(f"_del_confirm_{tid}", None)
    st.session_state.pop("_active_tech_profile_id", None)
    st.session_state.pop("_last_profile_ctx", None)


@st.dialog("🎉 " + "恭喜", on_dismiss=_on_congrats_member_dismiss)
def _dialog_member_added() -> None:
    info = st.session_state.get("_dlg_member_added")
    if not info:
        return
    st.markdown(f"### {t('dialog_congrats_title')}")
    st.success(
        t(
            "dialog_congrats_member",
            code=str(info["code"]),
            name=str(info["name"]),
        )
    )
    if st.button(t("close"), key="dlg_close_member", use_container_width=True):
        st.session_state.pop("_dlg_member_added", None)
        st.rerun()


@st.dialog("🎉 " + "恭喜", on_dismiss=_on_congrats_tech_dismiss)
def _dialog_tech_added() -> None:
    info = st.session_state.get("_dlg_tech_added")
    if not info:
        return
    st.markdown(f"### {t('dialog_congrats_title')}")
    st.success(
        t(
            "dialog_congrats_tech",
            code=str(info["code"]),
            name=str(info["name"]),
        )
    )
    if st.button(t("close"), key="dlg_close_tech", use_container_width=True):
        st.session_state.pop("_dlg_tech_added", None)
        st.rerun()


@st.dialog("➕ 新增会员", on_dismiss=_on_new_member_dismiss)
def _new_member_dialog() -> None:
    if not st.session_state.get("_open_new_member_dlg"):
        return
    nm_name = st.text_input(f"{t('member_name')} *", key="dlg_nm_name")
    nm_phone = st.text_input(t("member_phone"), key="dlg_nm_phone")
    nm_cont = st.text_input(t("member_contact_other"), key="dlg_nm_cont")
    nm_tier = st.radio(
        t("member_tier"),
        ["Casual", "Standard", "VIP", "Board"],
        format_func=lambda x: t(f"tier_{x}"),
        key="dlg_nm_tier",
        horizontal=True,
    )
    nm_note = st.text_area(t("member_notes"), key="dlg_nm_note")
    st.divider()
    c1, c2 = st.columns(2)
    with c1:
        if st.button(t("add"), key="dlg_nm_submit", type="primary",
                     use_container_width=True):
            if not nm_name.strip():
                st.error(t("member_name_required"))
            else:
                code = next_member_code(db)
                db.execute(
                    """INSERT INTO members
                       (code, display_name, phone, contact_other, tier, notes, created_by)
                       VALUES (?,?,?,?,?,?,?)""",
                    (code, nm_name.strip(), nm_phone, nm_cont, nm_tier, nm_note, user.id),
                )
                st.session_state.pop("_open_new_member_dlg", None)
                st.session_state.pop("_last_profile_ctx", None)
                st.session_state["_dlg_member_added"] = {
                    "code": code,
                    "name": nm_name.strip(),
                }
                st.rerun()
    with c2:
        if st.button(t("close"), key="dlg_nm_close", use_container_width=True):
            st.session_state.pop("_open_new_member_dlg", None)
            st.session_state.pop("_last_profile_ctx", None)
            st.rerun()


@st.dialog("🏠 房间详情", width="large", on_dismiss=_on_room_detail_dismiss)
def _room_detail_dialog() -> None:
    rid = st.session_state.get("_active_room_detail_id")
    if rid is None:
        return
    room = db.one("SELECT code, status FROM rooms WHERE id=?", (int(rid),))
    if not room:
        st.error("房间不存在")
        st.session_state.pop("_active_room_detail_id", None)
        return

    _code_esc = html.escape(str(room["code"]))
    st.markdown(
        f"<div style='font-size:1.75rem;font-weight:800;letter-spacing:0.06em;"
        f"color:var(--accent-gold);margin-bottom:0.75rem;'>{_code_esc}</div>",
        unsafe_allow_html=True,
    )
    info = _room_service_info(int(rid))
    if not info:
        st.info("该房间暂无进行中的服务记录")
    else:
        cd = _calc_countdown(info["started_at"], info["duration_mins"])
        cd_color = cd["color"]
        cd_label = html.escape(str(cd["label"]))
        countdown_html = (
            f"<span style='color:{cd_color};font-weight:800;font-size:1.15rem;'>"
            f"{cd_label}</span>"
        )
        st.markdown(
            f"<div class='on-card' style='padding:1rem 1.1rem;font-size:1.02rem;line-height:1.75;'>"
            f"<b>单号：</b>{html.escape(str(info['order_no']))}<br>"
            f"<b>技师：</b>{html.escape(str(info['tech_code']))} — "
            f"{html.escape(str(info['tech_name']))}<br>"
            f"<b>服务项目：</b>{html.escape(str(info['items_desc']))}<br>"
            f"<b>倒计时：</b>{countdown_html}"
            f"</div>",
            unsafe_allow_html=True,
        )
    st.divider()
    if st.button("关闭", key="dlg_room_detail_close", use_container_width=True):
        st.session_state.pop("_active_room_detail_id", None)
        st.session_state.pop("_last_profile_ctx", None)
        st.rerun()


def _tech_status_label_str(stv: str) -> str:
    m = {
        "available": t("tech_available"),
        "busy":      t("tech_busy"),
        "offline":   t("tech_offline"),
        "paused":    t("tech_paused"),
    }
    return m.get(stv, stv)


@st.dialog("会员资料", on_dismiss=_on_member_profile_dismiss)
def _member_profile_dialog() -> None:
    mid = st.session_state.get("_active_member_profile_id")
    if mid is None:
        return
    row = db.one("SELECT * FROM members WHERE id=?", (int(mid),))
    if not row:
        st.error(t("no_records"))
        st.session_state.pop("_active_member_profile_id", None)
        return
    m = apply_member_pii(dict(row), user.role)
    st.markdown(f"### {m['code']} — {m['display_name']}")
    st.markdown(
        f"<div class='on-card'>"
        f"<b>{t('member_tier')}：</b>{t('tier_' + m['tier'])}<br>"
        f"<b>{t('member_principal')}：</b>{cents_to_display(m['principal_cents'])}<br>"
        f"<b>{t('member_reward')}：</b>{cents_to_display(m['reward_cents'])}<br>"
        f"<b>{t('member_phone')}：</b>{m.get('phone') or '—'}<br>"
        f"<b>{t('member_contact_other')}：</b>{m.get('contact_other') or '—'}<br>"
        f"<b>{t('member_notes')}：</b>{m.get('notes') or '—'}"
        f"</div>",
        unsafe_allow_html=True,
    )
    st.divider()
    st.markdown("**快速充值**")
    tu_aud = st.number_input(
        t("topup_amount"),
        min_value=0.0, step=50.0,
        format="%.0f",
        key=f"dlg_tu_aud_{mid}",
    )
    tu_note = st.text_input(t("note"), key=f"dlg_tu_note_{mid}")
    if st.button(
        t("topup"),
        key=f"dlg_tu_btn_{mid}",
        type="primary",
        disabled=(mid is None or tu_aud <= 0),
        use_container_width=True,
    ):
        if mid is None:
            st.error("会员 ID 无效，请关闭弹窗后重新操作")
            st.stop()
        new_bal = topup_member(
            database=db,
            member_id=int(mid),
            amount_cents=dollars_to_cents(tu_aud),
            staff_id=user.id,
            note=tu_note,
        )
        st.session_state["_recv_member_flash"] = (
            f"✅ {t('topup_success')} — {cents_to_display(new_bal)}"
        )
        st.session_state.pop("_active_member_profile_id", None)
        st.session_state.pop("_last_profile_ctx", None)
        st.rerun()
    st.divider()
    if st.button(t("close"), key="dlg_close_member_profile", use_container_width=True):
        st.session_state.pop("_active_member_profile_id", None)
        st.session_state.pop("_last_profile_ctx", None)
        st.rerun()


@st.dialog("技师资料", width="large", on_dismiss=_on_tech_profile_dismiss)
def _tech_profile_dialog() -> None:
    tid = st.session_state.get("_active_tech_profile_id")
    if tid is None:
        return
    tr = db.one("SELECT * FROM technicians WHERE id=?", (int(tid),))
    if not tr:
        st.error(t("no_records"))
        st.session_state.pop("_active_tech_profile_id", None)
        st.session_state.pop("_last_profile_ctx", None)
        return
    r = dict(tr)

    # ── 大图查看模式 ──────────────────────────────────────────
    _view_idx = st.session_state.get(f"_tech_media_view_{tid}")
    if _view_idx is not None:
        media_rows_all = list_tech_media(db, int(tid))
        images_only = [m for m in media_rows_all if m["kind"] == "image"]
        if images_only and 0 <= _view_idx < len(images_only):
            mrow = images_only[_view_idx]
            p = abs_path(mrow["relative_path"])
            # 导航栏
            nav_l, nav_c, nav_r = st.columns([1, 3, 1])
            with nav_l:
                if st.button("← 返回列表", key=f"tlv_back_{tid}",
                             use_container_width=True):
                    st.session_state.pop(f"_tech_media_view_{tid}", None)
                    st.rerun()
            with nav_c:
                st.markdown(
                    f"<div style='text-align:center;color:#a89888;padding-top:.4rem;'>"
                    f"第 {_view_idx+1} / {len(images_only)} 张</div>",
                    unsafe_allow_html=True,
                )
            with nav_r:
                pass
            # 大图展示
            if p.exists():
                st.image(str(p), use_container_width=True)
            else:
                st.warning("文件不存在")
            # 上 / 下张
            pa, pb = st.columns(2)
            with pa:
                if st.button("◀ 上一张", key=f"tlv_prev_{tid}",
                             disabled=_view_idx <= 0,
                             use_container_width=True):
                    st.session_state[f"_tech_media_view_{tid}"] = _view_idx - 1
                    st.rerun()
            with pb:
                if st.button("下一张 ▶", key=f"tlv_next_{tid}",
                             disabled=_view_idx >= len(images_only) - 1,
                             use_container_width=True):
                    st.session_state[f"_tech_media_view_{tid}"] = _view_idx + 1
                    st.rerun()
        else:
            st.session_state.pop(f"_tech_media_view_{tid}", None)
            st.rerun()
        return  # 大图模式时不渲染其余内容

    # ── 基本资料 ──────────────────────────────────────────────
    st.markdown(f"### {r['code']} — {r['display_name']}")
    info_l, info_r = st.columns(2)
    with info_l:
        st.markdown(
            f"<div class='on-card' style='font-size:.9rem;line-height:1.8;'>"
            f"<b>{t('status')}：</b>{_tech_status_label_str(str(r['status']))}<br>"
            f"<b>{t('tech_nationality')}：</b>{r.get('nationality') or '—'}<br>"
            f"<b>{t('tech_languages')}：</b>{r.get('languages') or '—'}<br>"
            f"<b>{t('tech_specialty')}：</b>{r.get('specialty') or '—'}<br>"
            f"</div>",
            unsafe_allow_html=True,
        )
    with info_r:
        st.markdown(
            f"<div class='on-card' style='font-size:.9rem;line-height:1.8;'>"
            f"<b>{t('tech_height')}：</b>{r.get('height_cm') or '—'} cm<br>"
            f"<b>{t('tech_weight')}：</b>{r.get('weight_kg') or '—'} kg<br>"
            f"<b>{t('tech_bust')}：</b>{r.get('bust') or '—'}<br>"
            f"<b>{t('tech_price')}：</b>{cents_to_display(int(r['price_cents'] or 0))}<br>"
            f"</div>",
            unsafe_allow_html=True,
        )
    if r.get("bio"):
        st.caption(r["bio"])

    st.divider()

    # ── 媒体管理 ──────────────────────────────────────────────
    cnt = count_tech_media(db, int(tid))
    media_rows = list_tech_media(db, int(tid))
    images_only = [m for m in media_rows if m["kind"] == "image"]
    videos_only = [m for m in media_rows if m["kind"] == "video"]

    st.markdown(
        f"<div style='font-weight:700;font-size:.95rem;margin-bottom:.4rem;'>"
        f"相册 &nbsp;<span style='color:#a89888;font-size:.8rem;font-weight:400;'>"
        f"{cnt} / {MAX_TECH_MEDIA} 个文件</span></div>",
        unsafe_allow_html=True,
    )

    # 待删除确认 key
    _del_confirm_key = f"_del_confirm_{tid}"

    if not media_rows:
        st.caption("暂无媒体文件，请在下方上传")
    else:
        # ── 图片 3 列网格 ──
        if images_only:
            img_cols_per_row = 3
            for row_i in range(0, len(images_only), img_cols_per_row):
                chunk = list(enumerate(images_only[row_i: row_i + img_cols_per_row],
                                       start=row_i))
                g_cols = st.columns(img_cols_per_row)
                for ci, (img_idx, mrow) in enumerate(chunk):
                    with g_cols[ci]:
                        p = abs_path(mrow["relative_path"])
                        if p.exists():
                            st.image(str(p), use_container_width=True)
                        else:
                            st.markdown(
                                "<div style='background:#1a1a1a;border:1px solid #333;"
                                "border-radius:6px;height:120px;display:flex;"
                                "align-items:center;justify-content:center;"
                                "color:#666;font-size:.75rem;'>文件缺失</div>",
                                unsafe_allow_html=True,
                            )
                        # 操作按钮：放大 | 删除
                        btn_a, btn_b = st.columns(2)
                        with btn_a:
                            if st.button(
                                "🔍 放大",
                                key=f"tlv_open_{mrow['id']}_{tid}",
                                use_container_width=True,
                            ):
                                st.session_state[f"_tech_media_view_{tid}"] = img_idx
                                st.session_state.pop(_del_confirm_key, None)
                                st.rerun()
                        with btn_b:
                            confirm_id = st.session_state.get(_del_confirm_key)
                            if confirm_id == mrow["id"]:
                                # 二次确认状态
                                if st.button(
                                    "确认删除",
                                    key=f"tlv_del_confirm_{mrow['id']}_{tid}",
                                    type="primary",
                                    use_container_width=True,
                                ):
                                    delete_media_row(db, int(mrow["id"]), int(tid))
                                    st.session_state.pop(_del_confirm_key, None)
                                    # 保持弹窗打开，只刷新
                                    st.session_state["_active_tech_profile_id"] = int(tid)
                                    st.session_state["_last_profile_ctx"] = "tech"
                                    st.rerun()
                            else:
                                if st.button(
                                    "🗑 删除",
                                    key=f"tlv_del_{mrow['id']}_{tid}",
                                    use_container_width=True,
                                ):
                                    st.session_state[_del_confirm_key] = mrow["id"]
                                    st.rerun()

        # ── 视频列表 ──
        if videos_only:
            st.markdown(
                "<div style='font-size:.85rem;color:#a89888;"
                "margin:.6rem 0 .3rem;'>视频</div>",
                unsafe_allow_html=True,
            )
            for mrow in videos_only:
                vc1, vc2 = st.columns([5, 1])
                with vc1:
                    p = abs_path(mrow["relative_path"])
                    if p.exists():
                        st.video(str(p))
                    else:
                        st.caption(f"文件缺失：{mrow['relative_path']}")
                with vc2:
                    confirm_id = st.session_state.get(_del_confirm_key)
                    if confirm_id == mrow["id"]:
                        if st.button(
                            "确认",
                            key=f"tlv_del_v_confirm_{mrow['id']}_{tid}",
                            type="primary",
                            use_container_width=True,
                        ):
                            delete_media_row(db, int(mrow["id"]), int(tid))
                            st.session_state.pop(_del_confirm_key, None)
                            st.session_state["_active_tech_profile_id"] = int(tid)
                            st.session_state["_last_profile_ctx"] = "tech"
                            st.rerun()
                    else:
                        if st.button(
                            "🗑",
                            key=f"tlv_del_v_{mrow['id']}_{tid}",
                            use_container_width=True,
                        ):
                            st.session_state[_del_confirm_key] = mrow["id"]
                            st.rerun()

    # ── 上传区 ────────────────────────────────────────────────
    st.divider()
    if cnt >= MAX_TECH_MEDIA:
        st.warning(t("tech_media_max"))
    else:
        remaining = MAX_TECH_MEDIA - cnt
        new_files = st.file_uploader(
            f"上传照片/视频（还可上传 {remaining} 个）",
            type=["jpg", "jpeg", "png", "gif", "webp", "mp4", "webm", "mov"],
            accept_multiple_files=True,
            key=f"tech_up_{tid}",
        )
        if new_files:
            if st.button(
                f"💾 保存 {len(new_files)} 个文件",
                key=f"tech_up_btn_{tid}",
                type="primary",
                use_container_width=True,
            ):
                n, err = save_uploaded_media(db, int(tid), list(new_files))
                if err == "max_media":
                    st.warning(t("tech_media_max"))
                elif err == "partial_max":
                    st.warning(f"已保存 {n} 个（已达上限，其余跳过）")
                elif n:
                    st.success(f"已上传 {n} 个文件")
                    # 保持弹窗打开刷新
                    st.session_state["_active_tech_profile_id"] = int(tid)
                    st.session_state["_last_profile_ctx"] = "tech"
                    st.rerun()
                else:
                    st.warning("未找到可支持的文件格式")

    # ── 关闭按钮 ──────────────────────────────────────────────
    st.divider()
    if st.button(t("close"), key="dlg_close_tech_profile", use_container_width=True):
        st.session_state.pop("_active_tech_profile_id", None)
        st.session_state.pop("_last_profile_ctx", None)
        st.session_state.pop(f"_tech_media_view_{tid}", None)
        st.session_state.pop(f"_del_confirm_{tid}", None)
        st.rerun()


# ---------------------------------------------------------------------------
# Page header with back button
# ---------------------------------------------------------------------------

top_left, top_right = st.columns([6.2, 1.8])
with top_left:
    st.markdown(
        f"<div class='on-page-title'>🏮 {t('reception_title')}</div>"
        f"<div class='on-page-sub'>{t('business_day')}：{current_business_day().strftime('%Y-%m-%d')}</div>",
        unsafe_allow_html=True,
    )
with top_right:
    back_button(
        f"← {t('nav_home')}",
        "Home.py",
        use_container_width=True,
        key="recv_nav_home",
    )

# Fixed top-right home anchor for touch devices (iPad).
st.markdown(
    f"<a class='on-floating-home' href='/' target='_self'>← {t('nav_home')}</a>",
    unsafe_allow_html=True,
)

st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

tab_order, tab_tech_list, tab_member = st.tabs(
    [
        f"🧾 {t('new_order')}",
        f"📋 {t('reception_tech_list')}",
        f"👥 {t('reception_member_mgmt')}",
    ]
)

# 同一时刻只允许一个弹窗（Streamlit 限制）
# _last_profile_ctx: 'tech' | 'member' | 'new_member' | 'room'
_ctx = st.session_state.get("_last_profile_ctx", "")

if st.session_state.get("_dlg_member_added"):
    st.session_state.pop("_active_member_profile_id", None)
    st.session_state.pop("_active_tech_profile_id", None)
    st.session_state.pop("_active_room_detail_id", None)
    st.session_state.pop("_open_new_member_dlg", None)
    _dialog_member_added()
elif st.session_state.get("_dlg_tech_added"):
    st.session_state.pop("_active_member_profile_id", None)
    st.session_state.pop("_active_tech_profile_id", None)
    st.session_state.pop("_active_room_detail_id", None)
    st.session_state.pop("_open_new_member_dlg", None)
    _dialog_tech_added()
elif _ctx == "new_member" and st.session_state.get("_open_new_member_dlg"):
    _new_member_dialog()
elif _ctx == "member" and st.session_state.get("_active_member_profile_id") is not None:
    _member_profile_dialog()
elif _ctx == "tech" and st.session_state.get("_active_tech_profile_id") is not None:
    _tech_profile_dialog()
elif _ctx == "room" and st.session_state.get("_active_room_detail_id") is not None:
    _room_detail_dialog()


# ============================================================
# TAB 1: New Order
# ============================================================
with tab_order:
    left, right = st.columns([1.35, 1], gap="small")

    with left:
        st.markdown(f"**{t('payment_method')}**")
        pay_type = st.radio(
            t("payment_method"),
            options=["new_cash", "member", "cash"],
            format_func=lambda x: {
                "new_cash": t("pay_new_customer"),
                "member":   t("pay_member"),
                "cash":     t("pay_cash"),
            }[x],
            horizontal=True,
            key="pay_type",
            label_visibility="collapsed",
        )

        member_id = None
        is_new_customer = False
        referrer_id = None

        if pay_type == "member":
            q = st.text_input(t("member_search"), placeholder="编号 或 姓名", key="order_member_q")
            if q:
                results = _member_search_result(q)
                if results:
                    opts = {f"{r['code']} — {r['display_name']}": r["id"] for r in results}
                    keys = list(opts.keys())
                    pick = st.radio(
                        t("member_name"),
                        keys,
                        key="order_member_radio",
                        horizontal=len(keys) <= 4,
                    )
                    member_id = opts.get(pick)
                    if member_id:
                        mrow = db.one("SELECT * FROM members WHERE id=?", (member_id,))
                        if mrow:
                            m = apply_member_pii(dict(mrow), user.role)
                            st.markdown(
                                f"<div class='on-card'>"
                                f"<b>{m['display_name']}</b> &ensp; "
                                f"<span style='color:#d4a843'>{t('tier_' + m['tier'])}</span><br>"
                                f"{t('member_principal')}：<b style='color:#4caf80'>"
                                f"{cents_to_display(m['principal_cents'])}</b>"
                                f"&ensp;{t('member_reward')}：<b style='color:#d4a843'>"
                                f"{cents_to_display(m['reward_cents'])}</b>"
                                f"</div>",
                                unsafe_allow_html=True,
                            )
                else:
                    st.info(t("no_records"))

        elif pay_type == "new_cash":
            is_new_customer = True
            ref_q = st.text_input(t("referrer_code"), key="referrer_q")
            if ref_q:
                ref_rows = _member_search_result(ref_q)
                if ref_rows:
                    ref_opts = {f"{r['code']} — {r['display_name']}": r["id"] for r in ref_rows}
                    rk = list(ref_opts.keys())
                    ref_pick = st.radio(
                        "推荐人",
                        rk,
                        key="ref_radio",
                        horizontal=len(rk) <= 4,
                    )
                    referrer_id = ref_opts.get(ref_pick)

        # —— 快速套餐选择 ——
        st.markdown(f"**{t('order_items')}**")
        with st.expander("📋 快速套餐选择", expanded=True):
            _fill = st.session_state.get("_preset_fill")
            for preset in SERVICE_PRESETS:
                col_name, *col_opts = st.columns([2] + [1] * len(preset["options"]))
                with col_name:
                    st.markdown(
                        f"<div style='padding-top:0.45rem;'>"
                        f"<b>{preset['name']}</b>"
                        f"<br><span style='color:#888;font-size:0.78rem;'>{preset['desc']}</span>"
                        f"</div>",
                        unsafe_allow_html=True,
                    )
                for col, (dur, price) in zip(col_opts, preset["options"]):
                    with col:
                        fill_key = f"{preset['name']} {dur}"
                        is_selected = (
                            _fill is not None
                            and _fill.get("name") == fill_key
                        )
                        btn_label = f"{'✅ ' if is_selected else ''}{dur}\n${price}"
                        if st.button(
                            btn_label,
                            key=f"preset_{preset['name']}_{dur}",
                            use_container_width=True,
                            type="primary" if is_selected else "secondary",
                        ):
                            st.session_state["_preset_fill"] = {
                                "name": fill_key,
                                "price": price,
                            }
                            # 直接写入 item_desc_0 / item_price_0 的 session key
                            st.session_state["item_desc_0"] = fill_key
                            st.session_state["item_price_0"] = float(price)
                            st.rerun()

        n_items = st.number_input(
            "项目数量", min_value=1, max_value=10, value=1, step=1, key="n_items"
        )

        lines: list[OrderLine] = []
        for i in range(int(n_items)):
            ci1, ci2, ci3 = st.columns([2.5, 1.2, 0.8])
            with ci1:
                desc = st.text_input(
                    t("item_name"), key=f"item_desc_{i}", placeholder=f"项目 {i+1}"
                )
            with ci2:
                price_aud = st.number_input(
                    t("item_price"), min_value=0.0, step=5.0,
                    key=f"item_price_{i}", format="%.0f"
                )
            with ci3:
                qty = st.number_input(
                    t("item_qty"), min_value=1, max_value=99,
                    value=1, step=1, key=f"item_qty_{i}"
                )
            if desc.strip():
                lines.append(OrderLine(
                    description=desc.strip(),
                    unit_price_cents=dollars_to_cents(price_aud),
                    qty=int(qty),
                ))

        if lines:
            total_cents = sum(ln.line_total_cents for ln in lines)
            st.markdown(
                f"<div class='on-card'>"
                f"{t('order_total')}：<b style='color:#d4a843;font-size:1.3rem'>"
                f"{cents_to_display(total_cents)}</b>"
                f"</div>",
                unsafe_allow_html=True,
            )

        # —— 左下角：选择技师（紧凑）——
        st.markdown('<p class="on-tech-sep"></p>', unsafe_allow_html=True)
        th1, th2 = st.columns([0.48, 0.52], gap="small")
        with th1:
            st.markdown(
                f"<div style='font-size:0.92rem;font-weight:700;padding-top:0.15rem;'>"
                f"{t('select_tech')}</div>",
                unsafe_allow_html=True,
            )
        with th2:
            # 默认不勾选：默认点钟手动选技师；勾选后才用轮牌队列
            use_rotation = st.checkbox(
                t("tech_rotation_mode"), value=False, key="recv_use_rotation"
            )
        tech_options = _tech_options()
        tech_id = None
        if use_rotation:
            st.session_state.pop("order_pick_tech_id", None)
            nxt = next_rotation_tech(db)
            if nxt:
                st.markdown(
                    f"<div class='on-tech-card'>"
                    f"<span style='color:#a89888;font-size:.75rem;'>"
                    f"{t('tech_rotation_short')}</span> "
                    f"<b>{nxt['code']}</b> — {nxt['display_name']}"
                    f"</div>",
                    unsafe_allow_html=True,
                )
                tech_id = nxt["id"]
            else:
                st.markdown(
                    f"<div class='on-tech-alert'>{t('tech_none_available')}</div>",
                    unsafe_allow_html=True,
                )
        else:
            if tech_options:
                # 先取当前选中 id，校验是否仍在可用列表中
                _picked = st.session_state.get("order_pick_tech_id")
                if _picked and _picked not in tech_options.values():
                    _picked = None
                    st.session_state.pop("order_pick_tech_id", None)

                pairs = list(tech_options.items())
                _tcols = 5
                for t_row in range(0, len(pairs), _tcols):
                    chunk = pairs[t_row : t_row + _tcols]
                    tcols = st.columns(len(chunk))
                    for ti, (tlab, _tid) in enumerate(chunk):
                        with tcols[ti]:
                            short = tlab if len(tlab) <= 14 else tlab[:12] + "…"
                            is_selected = (_picked == _tid)
                            btn_label = f"✅ {short}" if is_selected else short
                            if st.button(
                                btn_label,
                                key=f"tpick_{_tid}",
                                use_container_width=True,
                                type="primary" if is_selected else "secondary",
                            ):
                                st.session_state["order_pick_tech_id"] = _tid
                                st.rerun()
                tech_id = _picked
                if not tech_id:
                    st.caption(f"👆 {t('tech_pick_hint')}")
                else:
                    # 显示当前选中技师
                    _sel_label = next(
                        (lab for lab, v in tech_options.items() if v == tech_id), ""
                    )
                    st.markdown(
                        f"<div class='on-tech-card'>"
                        f"<span style='color:#4caf80;font-weight:700;'>✅ 已选：</span> "
                        f"{_sel_label}"
                        f"</div>",
                        unsafe_allow_html=True,
                    )
            else:
                st.markdown(
                    f"<div class='on-tech-alert'>{t('tech_none_available')}</div>",
                    unsafe_allow_html=True,
                )

    with right:
        # 收款开单成功 flash（跨 rerun 显示）
        _order_ok = st.session_state.pop("_order_success_flash", None)
        if _order_ok:
            st.success(_order_ok[0])
            for extra in _order_ok[1:]:
                if extra.startswith("💰"):
                    st.info(extra)
                elif extra.startswith("⚠️"):
                    st.warning(extra)

        st.markdown(f"**{t('select_room')}**")
        st.caption(t("room_grid_hint_service"))
        st.caption(t("room_grid_hint_click"))

        # 房间网格：不要用 @st.fragment(run_every=…) 包裹按钮。
        # Fragment 部分重跑时，多按钮的点击与循环变量 rid 易错位，导致「点任何房间都弹同一间」。
        rooms_grid = _rooms_for_order_grid()
        sel_raw = st.session_state.get("reception_selected_room_id")

        if not rooms_grid:
            st.warning(t("room_none_in_db"))
        else:
            busy_service_rooms = _busy_service_room_ids()
            # 为每个房间按钮注入精准 CSS。
            # Streamlit 1.55 中 st.button 的 data-testid 固定为 stButton，不能按 key 选；
            # st.container(key=...) 会在 DOM 上生成 class「st-key-{key}」，用其包裹按钮再选子 button。
            style_parts: list[str] = []
            for r in rooms_grid:
                rid = int(r["id"])
                db_st = str(r["status"])
                status = _effective_room_status(db_st, rid, busy_service_rooms)
                is_sel = (
                    sel_raw is not None
                    and int(sel_raw) == rid
                    and _room_is_selectable_free(db_st, rid, busy_service_rooms)
                )
                # element id 后缀为 user_key；零填充避免 5 与 50 子串冲突
                _wk = f"onvms_room_{rid:04d}"
                sel_part = f"[class*='-{_wk}'] button"

                if is_sel:
                    style_parts.append(
                        f"{sel_part}{{"
                        f"background:rgba(212,168,67,0.18)!important;"
                        f"border-color:var(--accent-gold)!important;"
                        f"color:var(--accent-gold)!important;"
                        f"box-shadow:0 0 0 3px rgba(212,168,67,0.4)!important;"
                        f"}}"
                    )
                elif status == "free":
                    style_parts.append(
                        f"{sel_part}{{"
                        f"background:rgba(76,175,128,0.10)!important;"
                        f"border-color:#2d6a4f!important;"
                        f"color:#d4e8dc!important;"
                        f"}}"
                        f"{sel_part}:hover{{"
                        f"background:rgba(76,175,128,0.22)!important;"
                        f"border-color:#4caf80!important;"
                        f"}}"
                    )
                elif status == "occupied":
                    style_parts.append(
                        f"{sel_part}{{"
                        f"background:rgba(42,42,42,0.92)!important;"
                        f"border-color:#4a4a4a!important;"
                        f"color:#bbb!important;"
                        f"}}"
                        f"{sel_part}:hover{{"
                        f"border-color:#888!important;"
                        f"background:rgba(60,60,60,0.95)!important;"
                        f"}}"
                    )
                else:
                    style_parts.append(
                        f"{sel_part}{{"
                        f"background:rgba(139,41,66,0.14)!important;"
                        f"border-color:#8b2942!important;"
                        f"color:#c07080!important;"
                        f"opacity:0.7!important;"
                        f"}}"
                    )

            common_css = (
                "[class*='-onvms_room_'] button{"
                "min-height:5.25rem;"
                "border-radius:12px;"
                "border-width:2px;"
                "border-style:solid;"
                "font-size:1.02rem;"
                "font-weight:700;"
                "line-height:1.45;"
                "letter-spacing:0.02em;"
                "white-space:pre-line;"
                "padding:0.55rem 0.4rem;"
                "width:100%;"
                "box-shadow:0 2px 8px rgba(0,0,0,0.35);"
                "transition:box-shadow 0.15s,border-color 0.15s,transform 0.12s;"
                "}"
                "[class*='-onvms_room_'] button:hover:not(:disabled){"
                "transform:translateY(-1px);"
                "}"
            )
            st.markdown(
                f"<style>{common_css}{''.join(style_parts)}</style>",
                unsafe_allow_html=True,
            )

            for row_start in range(0, len(rooms_grid), ROOM_GRID_COLS):
                chunk = rooms_grid[row_start : row_start + ROOM_GRID_COLS]
                rcols = st.columns(ROOM_GRID_COLS)
                for col_i, r in enumerate(chunk):
                    with rcols[col_i]:
                        rid = int(r["id"])
                        db_st = str(r["status"])
                        status = _effective_room_status(db_st, rid, busy_service_rooms)
                        is_sel = (
                            sel_raw is not None
                            and int(sel_raw) == rid
                            and _room_is_selectable_free(db_st, rid, busy_service_rooms)
                        )

                        cd_line = ""
                        if status == "occupied":
                            svc = _room_service_info(rid)
                            if svc:
                                cd = _calc_countdown(
                                    svc["started_at"], svc["duration_mins"]
                                )
                                cd_line = f"\n{cd['label']}"

                        st_lbl = t(f"room_{status}")
                        if is_sel:
                            btn_text = f"✅ {r['code']}\n{st_lbl}"
                        else:
                            btn_text = f"{r['code']}\n{st_lbl}{cd_line}"

                        disabled = status not in ("free", "occupied")
                        btn_key = f"recv_room_btn_{rid}"
                        wrap_key = f"onvms_room_{rid:04d}"

                        with st.container(key=wrap_key):
                            if status == "free":
                                st.button(
                                    btn_text,
                                    key=btn_key,
                                    use_container_width=True,
                                    disabled=disabled,
                                    on_click=_toggle_free_room_click,
                                    args=(rid,),
                                )
                            elif status == "occupied":
                                st.button(
                                    btn_text,
                                    key=btn_key,
                                    use_container_width=True,
                                    disabled=disabled,
                                    on_click=_open_room_detail_click,
                                    args=(rid,),
                                )
                            else:
                                st.button(
                                    btn_text,
                                    key=btn_key,
                                    use_container_width=True,
                                    disabled=True,
                                )

            if not any(
                _room_is_selectable_free(str(x["status"]), int(x["id"]), busy_service_rooms)
                for x in rooms_grid
            ):
                st.warning(t("room_no_free"))

        room_id = _sync_room_selection()
        if st.session_state.get("reception_selected_room_id") and room_id is None:
            st.warning(t("room_stale"))

        note = st.text_input(t("note"), key="order_note")

        st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

        # 显示开单错误（从 session_state flash 取）
        _order_err = st.session_state.pop("_order_error_flash", None)
        if _order_err:
            st.error(_order_err)

        # 未满足条件时给出明确提示
        _missing = []
        if not lines:
            _missing.append("⬅️ 请填写至少一个**项目名称**")
        if not tech_id:
            _missing.append("⬅️ 请选择技师")
        if not room_id:
            _missing.append("⬅️ 请选择房间")
        if _missing:
            for _m in _missing:
                st.caption(_m)

        if st.button(
            t("confirm_order"), key="confirm_order_btn",
            type="primary", use_container_width=True,
            disabled=not (lines and tech_id and room_id),
        ):
            payment = PAYMENT_MEMBER if pay_type == "member" else PAYMENT_CASH
            try:
                row_chk = db.one(
                    "SELECT id, status FROM rooms WHERE id=?", (room_id,)
                )
                if not row_chk or str(row_chk["status"]) != "free":
                    st.session_state["_order_error_flash"] = t("room_stale")
                    st.rerun()
                else:
                    result = create_order(
                        database=db,
                        technician_id=tech_id,
                        room_id=room_id,
                        staff_id=user.id,
                        lines=lines,
                        payment_method=payment,
                        member_id=member_id,
                        is_new_customer=is_new_customer,
                        referrer_id=referrer_id,
                        note=note,
                    )
                    # 清空选中状态，再跳转显示成功
                    st.session_state["reception_selected_room_id"] = None
                    st.session_state.pop("order_pick_tech_id", None)
                    st.session_state.pop("_preset_fill", None)
                    msg_parts = [
                        t(
                            "order_success_paid",
                            order_no=str(result.order_no),
                            total=cents_to_display(result.items_total_cents),
                        )
                    ]
                    if result.cashback_cents:
                        msg_parts.append(
                            f"💰 {t('cashback')}：{cents_to_display(result.cashback_cents)}"
                        )
                    if result.board_warning:
                        msg_parts.append("⚠️ 董事余额偏低，请提醒续费")
                    st.session_state["_order_success_flash"] = msg_parts
                    st.rerun()
            except ValueError as e:
                msg = str(e)
                if msg == "insufficient_balance":
                    st.session_state["_order_error_flash"] = t(
                        "order_insufficient_balance"
                    )
                elif msg == "room_not_found":
                    st.session_state["_order_error_flash"] = "所选房间不存在，请重新选择房间"
                elif msg == "room_not_free":
                    st.session_state["_order_error_flash"] = (
                        "该房间已不是空闲状态，请刷新后另选房间"
                    )
                elif msg == "room_occupancy_failed":
                    st.session_state["_order_error_flash"] = (
                        "房间占用失败（可能已被占用），请刷新后重试"
                    )
                else:
                    st.session_state["_order_error_flash"] = (
                        t("order_failed_prefix") + msg
                    )
                st.rerun()

    # ============================================================
    # 订单统计报表（tab_order 下半区）
    # ============================================================
    st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)
    st.markdown("#### 📊 订单统计")

    # —— 日期查询控件 ——
    _today = _date.today()

    _sq1, _sq2, _sq3 = st.columns([1, 1, 0.6])
    with _sq1:
        _stat_start = st.date_input(
            "开始日期", value=_today, key="stat_date_start"
        )
    with _sq2:
        _stat_end = st.date_input(
            "结束日期", value=_today, key="stat_date_end"
        )
    with _sq3:
        st.markdown("<div style='height:1.85rem'></div>", unsafe_allow_html=True)
        if st.button("🔍 查询", key="stat_query_btn", use_container_width=True):
            st.session_state["_stat_page"] = 1

    # 日期变化时自动重置页码
    _stat_sig = f"{_stat_start}_{_stat_end}"
    if st.session_state.get("_stat_last_sig") != _stat_sig:
        st.session_state["_stat_page"] = 1
        st.session_state["_stat_last_sig"] = _stat_sig

    _STAT_PAGE_SIZE = 50
    _stat_page = int(st.session_state.get("_stat_page", 1))
    _stat_offset = (_stat_page - 1) * _STAT_PAGE_SIZE

    _start_str = str(_stat_start)
    _end_str   = str(_stat_end)

    # —— 汇总查询 ——
    _summary = db.one(
        """
        SELECT
            COUNT(*)                        AS total_orders,
            COALESCE(SUM(items_total_cents), 0)        AS total_cents,
            COALESCE(SUM(cashback_earned_cents), 0)    AS total_cashback,
            SUM(CASE WHEN payment_method='member' THEN 1 ELSE 0 END) AS member_cnt,
            SUM(CASE WHEN payment_method='cash'   THEN 1 ELSE 0 END) AS cash_cnt
        FROM orders
        WHERE status = 'paid'
          AND date(paid_at) BETWEEN ? AND ?
        """,
        (_start_str, _end_str),
    )

    # —— 汇总卡片 ——
    _sc1, _sc2, _sc3, _sc4, _sc5 = st.columns(5)
    _card_css = "background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:0.55rem 0.7rem;text-align:center;"
    _val_css  = "font-size:1.25rem;font-weight:700;color:var(--accent-gold);"
    _lbl_css  = "font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem;"

    def _stat_card(col, label: str, value: str) -> None:
        with col:
            st.markdown(
                f"<div style='{_card_css}'>"
                f"<div style='{_val_css}'>{value}</div>"
                f"<div style='{_lbl_css}'>{label}</div>"
                f"</div>",
                unsafe_allow_html=True,
            )

    _total_orders = int(_summary["total_orders"]) if _summary and _summary["total_orders"] else 0
    _total_cents     = int(_summary["total_cents"])    if _summary and _summary["total_cents"]    else 0
    _total_cashback  = int(_summary["total_cashback"]) if _summary and _summary["total_cashback"] else 0
    _member_cnt      = int(_summary["member_cnt"])     if _summary and _summary["member_cnt"]     else 0
    _cash_cnt        = int(_summary["cash_cnt"])       if _summary and _summary["cash_cnt"]       else 0
    _total_pages     = max(1, (_total_orders + _STAT_PAGE_SIZE - 1) // _STAT_PAGE_SIZE)

    _stat_card(_sc1, "订单总数",   str(_total_orders))
    _stat_card(_sc2, "合计金额",   cents_to_display(_total_cents))
    _stat_card(_sc3, "会员消费笔", str(_member_cnt))
    _stat_card(_sc4, "现金消费笔", str(_cash_cnt))
    _stat_card(_sc5, "返现合计",   cents_to_display(_total_cashback))

    st.markdown("<div style='height:0.5rem'></div>", unsafe_allow_html=True)

    # —— 明细查询（分页）——
    _order_rows = db.all(
        """
        SELECT
            o.order_no, o.paid_at, o.items_total_cents,
            o.cashback_earned_cents, o.payment_method, o.note,
            o.principal_used_cents, o.reward_used_cents, o.cash_paid_cents,
            t.code      AS tech_code,
            t.display_name AS tech_name,
            GROUP_CONCAT(l.description, '、') AS items_desc
        FROM orders o
        JOIN technicians t  ON o.technician_id = t.id
        LEFT JOIN order_lines l ON l.order_id  = o.id
        WHERE o.status = 'paid'
          AND date(o.paid_at) BETWEEN ? AND ?
        GROUP BY o.id
        ORDER BY o.paid_at DESC
        LIMIT ? OFFSET ?
        """,
        (_start_str, _end_str, _STAT_PAGE_SIZE, _stat_offset),
    )

    # —— 列表表头 ——
    if _order_rows:
        _hc = st.columns([1.2, 0.9, 1.0, 2.2, 1.0, 0.8, 0.8])
        for _col, _hdr in zip(
            _hc,
            ["单号", "时间", "技师", "服务项目", "金额(AUD)", "付款方式", "返现"],
        ):
            with _col:
                st.markdown(
                    f"<div style='font-size:0.75rem;font-weight:700;"
                    f"color:var(--text-muted);padding-bottom:0.2rem;"
                    f"border-bottom:1px solid var(--border);'>{_hdr}</div>",
                    unsafe_allow_html=True,
                )

        # —— 明细行 ——
        _pay_label = {"member": "会员", "member_account": "会员", "cash": "现金", "split": "混合"}
        for _row in _order_rows:
            _rc = st.columns([1.2, 0.9, 1.0, 2.2, 1.0, 0.8, 0.8])
            _paid_at_str = str(_row["paid_at"] or "")[:16].replace("T", " ")
            _cashback = int(_row["cashback_earned_cents"] or 0)
            with _rc[0]:
                st.markdown(
                    f"<div style='font-size:0.75rem;padding:0.25rem 0;'>"
                    f"{_row['order_no']}</div>",
                    unsafe_allow_html=True,
                )
            with _rc[1]:
                st.markdown(
                    f"<div style='font-size:0.75rem;padding:0.25rem 0;'>"
                    f"{_paid_at_str}</div>",
                    unsafe_allow_html=True,
                )
            with _rc[2]:
                st.markdown(
                    f"<div style='font-size:0.75rem;padding:0.25rem 0;'>"
                    f"{_row['tech_code']} {_row['tech_name']}</div>",
                    unsafe_allow_html=True,
                )
            with _rc[3]:
                st.markdown(
                    f"<div style='font-size:0.75rem;padding:0.25rem 0;'>"
                    f"{_row['items_desc'] or '—'}</div>",
                    unsafe_allow_html=True,
                )
            with _rc[4]:
                st.markdown(
                    f"<div style='font-size:0.75rem;font-weight:700;"
                    f"color:var(--accent-gold);padding:0.25rem 0;'>"
                    f"{cents_to_display(int(_row['items_total_cents']))}</div>",
                    unsafe_allow_html=True,
                )
            with _rc[5]:
                st.markdown(
                    f"<div style='font-size:0.75rem;padding:0.25rem 0;'>"
                    f"{_pay_label.get(str(_row['payment_method']), _row['payment_method'])}"
                    f"</div>",
                    unsafe_allow_html=True,
                )
            with _rc[6]:
                _cb_color = "var(--accent-gold)" if _cashback else "var(--text-faint)"
                _cb_text  = cents_to_display(_cashback) if _cashback else "—"
                st.markdown(
                    f"<div style='font-size:0.75rem;color:{_cb_color};"
                    f"padding:0.25rem 0;'>{_cb_text}</div>",
                    unsafe_allow_html=True,
                )
            st.markdown(
                "<hr style='margin:0;border:none;border-top:1px solid var(--border);'>",
                unsafe_allow_html=True,
            )
    else:
        st.info("该时间段内暂无已完成订单")

    # —— 分页控件 ——
    if _total_pages > 1:
        _pg1, _pg2, _pg3 = st.columns([1, 2, 1])
        with _pg1:
            if st.button("← 上一页", key="stat_prev", disabled=_stat_page <= 1,
                         use_container_width=True):
                st.session_state["_stat_page"] = _stat_page - 1
                st.rerun()
        with _pg2:
            st.markdown(
                f"<div style='text-align:center;padding-top:0.4rem;"
                f"font-size:0.82rem;color:var(--text-muted);'>"
                f"第 {_stat_page} 页 / 共 {_total_pages} 页"
                f"（共 {_total_orders} 条）</div>",
                unsafe_allow_html=True,
            )
        with _pg3:
            if st.button("下一页 →", key="stat_next",
                         disabled=_stat_page >= _total_pages,
                         use_container_width=True):
                st.session_state["_stat_page"] = _stat_page + 1
                st.rerun()


# ============================================================
# TAB 2: 技师列表（每行编号按钮 + 单行操作 + 批量操作）
# ============================================================
with tab_tech_list:
    _flash = st.session_state.pop("_recv_tech_flash", None)
    if _flash:
        if _flash == t("batch_no_match"):
            st.warning(_flash)
        else:
            st.success(_flash)

    st.markdown(f"#### {t('reception_tech_list')}")
    st.caption(t("reception_tech_list_hint"))

    # ── 新增技师（折叠）──────────────────────────────────────
    with st.expander(f"➕ {t('reception_new_tech')}", expanded=False):
        st.caption(t("reception_new_tech_caption"))
        rt_code = st.text_input(f"{t('tech_code')} *（如 T001）", key="recv_tech_code")
        rt_name = st.text_input(f"{t('tech_name')} *", key="recv_tech_name")
        rt_spec = st.text_input(t("tech_specialty"), key="recv_tech_spec")
        rt_nation = st.text_input(t("tech_nationality"), key="recv_tech_nation")
        rt_lang = st.text_input(
            t("tech_languages"),
            placeholder="粤语,普通话,英语",
            key="recv_tech_lang",
        )
        col_rh, col_rw = st.columns(2)
        with col_rh:
            rt_height = st.number_input(
                f"{t('tech_height')} (cm)", min_value=0.0, step=1.0, key="recv_tech_h"
            )
        with col_rw:
            rt_weight = st.number_input(
                f"{t('tech_weight')} (kg)", min_value=0.0, step=0.5, key="recv_tech_w"
            )
        rt_bust = st.text_input(t("tech_bust"), key="recv_tech_bust")
        rt_price = st.number_input(
            t("tech_price_aud"), min_value=0.0, step=5.0, key="recv_tech_price"
        )
        rt_bio = st.text_area(t("tech_bio_short"), key="recv_tech_bio")
        st.caption(t("tech_media_limit", n=MAX_TECH_MEDIA))
        rt_files = st.file_uploader(
            t("tech_media_upload"),
            type=["jpg", "jpeg", "png", "gif", "webp", "mp4", "webm", "mov"],
            accept_multiple_files=True,
            key="recv_tech_media_files",
        )
        if st.button(t("add"), key="recv_tech_submit_btn", type="primary"):
            if not rt_code.strip() or not rt_name.strip():
                st.error(t("tech_code_name_required"))
            else:
                try:
                    new_id = db.execute_insert(
                        """INSERT INTO technicians
                           (code, display_name, specialty, nationality, languages,
                            height_cm, weight_kg, bust, price_cents, bio, status)
                           VALUES (?,?,?,?,?,?,?,?,?,?,'offline')""",
                        (
                            rt_code.strip(), rt_name.strip(), rt_spec, rt_nation,
                            rt_lang, rt_height or None, rt_weight or None,
                            rt_bust, dollars_to_cents(rt_price), rt_bio,
                        ),
                    )
                    if rt_files:
                        save_uploaded_media(db, int(new_id), list(rt_files))
                    st.session_state["_dlg_tech_added"] = {
                        "code": rt_code.strip(),
                        "name": rt_name.strip(),
                    }
                    st.rerun()
                except Exception as e:
                    st.error(f"保存失败：{e}")

    st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

    # ── 搜索（点击按钮后才执行）──────────────────────────────────────
    st.session_state.setdefault("recv_tech_list_filter_applied", "")
    with st.form("recv_tech_list_search_form", clear_on_submit=False):
        tq = st.text_input(
            t("search"),
            key="recv_tech_list_filter",
            placeholder=t("tech_wall_search_placeholder"),
        )
        sf_col1, sf_col2, _ = st.columns([1.2, 1.2, 6.0])
        with sf_col1:
            do_search = st.form_submit_button(t("search"), use_container_width=True)
        with sf_col2:
            do_clear = st.form_submit_button("清空", use_container_width=True)
    if do_search:
        st.session_state["recv_tech_list_filter_applied"] = (tq or "").strip()
    if do_clear:
        st.session_state["recv_tech_list_filter"] = ""
        st.session_state["recv_tech_list_filter_applied"] = ""
        st.rerun()

    tq_l = st.session_state.get("recv_tech_list_filter_applied", "").lower()

    all_chk = db.all(
        """
        SELECT id, code, display_name, status, price_cents
        FROM technicians WHERE is_active = 1 ORDER BY code
        """
    )
    if tq_l:
        all_chk = [
            r for r in all_chk
            if tq_l in str(r.get("code") or "").lower()
            or tq_l in str(r.get("display_name") or "").lower()
        ]

    if not all_chk:
        st.info(t("no_records"))
    else:
        # ── 常量 ──
        _SB = {"available": "🟢", "busy": "🔴", "offline": "⚫", "paused": "🟡"}
        _STATUS_ORDER = {"available": 0, "busy": 1, "paused": 2, "offline": 3}

        # ── 排序状态 ──────────────────────────────────────────
        # tl_sort_col   : 'code' | 'status' | 'price_cents'
        # tl_sort_asc   : True / False
        # tl_sort_sticky: True = 用户主动点了排序列，保持排序直到下次操作
        #                 False（默认）= 操作后恢复按编号固定顺序
        if "tl_sort_col" not in st.session_state:
            st.session_state["tl_sort_col"] = "code"
            st.session_state["tl_sort_asc"] = True
            st.session_state["tl_sort_sticky"] = False

        def _toggle_sort(col: str) -> None:
            """用户主动点列头：切换排序并标记为 sticky。"""
            if st.session_state["tl_sort_col"] == col:
                st.session_state["tl_sort_asc"] = not st.session_state["tl_sort_asc"]
            else:
                st.session_state["tl_sort_col"] = col
                st.session_state["tl_sort_asc"] = True
            st.session_state["tl_sort_sticky"] = True

        def _reset_sort() -> None:
            """操作（签到/签退等）后重置为按编号顺序，排版不动。"""
            st.session_state["tl_sort_col"] = "code"
            st.session_state["tl_sort_asc"] = True
            st.session_state["tl_sort_sticky"] = False

        _sc = st.session_state["tl_sort_col"]
        _sa = st.session_state["tl_sort_asc"]

        # 排序
        def _sort_key(r: dict):
            if _sc == "status":
                return _STATUS_ORDER.get(str(r.get("status", "offline")), 9)
            if _sc == "price_cents":
                return int(r.get("price_cents") or 0)
            return str(r.get("code") or "")

        all_chk_sorted = sorted(all_chk, key=_sort_key, reverse=not _sa)

        # ── 多选用 labels（含状态标注，用排序后顺序）──
        labels = [
            f"{r['code']} — {r['display_name']}"
            f" [{_SB.get(str(r['status']), '')} {_tech_status_label_str(str(r['status']))}]"
            for r in all_chk_sorted
        ]
        id_by_label     = {lab: int(r["id"])    for lab, r in zip(labels, all_chk_sorted)}
        label_to_status = {lab: str(r["status"]) for lab, r in zip(labels, all_chk_sorted)}

        # ── 表头（可排序列用按钮）─────────────────────────────
        def _hdr_label(col_key: str, display: str) -> str:
            if _sc == col_key:
                arrow = " ▲" if _sa else " ▼"
                return f"{display}{arrow}"
            return display

        hdr = st.columns([1.2, 2.2, 1.6, 1.4, 3.2])
        # 编号（可排序）
        def _clear_all_ctx() -> None:
            st.session_state.pop("_last_profile_ctx", None)
            st.session_state.pop("_active_tech_profile_id", None)
            st.session_state.pop("_active_room_detail_id", None)
            st.session_state.pop("_active_member_profile_id", None)
            st.session_state.pop("_open_new_member_dlg", None)

        with hdr[0]:
            if st.button(
                _hdr_label("code", t("tech_code")),
                key="tl_sort_btn_code",
                use_container_width=True,
            ):
                _toggle_sort("code")
                _clear_all_ctx()
                st.rerun()
        # 姓名（不可排序，纯文字）
        hdr[1].markdown(
            f"<div style='font-size:.78rem;color:#a89888;font-weight:700;"
            f"padding-bottom:.25rem;padding-top:.35rem;'>{t('tech_name')}</div>",
            unsafe_allow_html=True,
        )
        # 状态（可排序）
        with hdr[2]:
            if st.button(
                _hdr_label("status", t("status")),
                key="tl_sort_btn_status",
                use_container_width=True,
            ):
                _toggle_sort("status")
                _clear_all_ctx()
                st.rerun()
        # 起步价（可排序）
        with hdr[3]:
            if st.button(
                _hdr_label("price_cents", t("tech_price")),
                key="tl_sort_btn_price",
                use_container_width=True,
            ):
                _toggle_sort("price_cents")
                _clear_all_ctx()
                st.rerun()
        # 操作（不可排序）
        hdr[4].markdown(
            f"<div style='font-size:.78rem;color:#a89888;font-weight:700;"
            f"padding-bottom:.25rem;padding-top:.35rem;'>{t('actions')}</div>",
            unsafe_allow_html=True,
        )
        st.markdown("<hr style='margin:.2rem 0 .4rem;border-color:#333'>",
                    unsafe_allow_html=True)

        # ── 每行技师 ──────────────────────────────────────────
        for r in all_chk_sorted:
            rid   = int(r["id"])
            stv   = str(r["status"])
            badge = _SB.get(stv, "")
            c_id, c_name, c_st, c_price, c_ops = st.columns([1.2, 2.2, 1.6, 1.4, 3.2])

            # 编号列 → 点击弹窗
            with c_id:
                if st.button(
                    r["code"],
                    key=f"tc_prof_{rid}",
                    use_container_width=True,
                    help="点击查看 / 编辑资料",
                ):
                    st.session_state["_active_tech_profile_id"] = rid
                    st.session_state["_last_profile_ctx"] = "tech"
                    st.session_state.pop("_active_member_profile_id", None)
                    st.rerun()

            # 姓名
            c_name.markdown(
                f"<div style='padding-top:.45rem;font-size:.92rem;'>{r['display_name']}</div>",
                unsafe_allow_html=True,
            )

            # 状态 badge
            c_st.markdown(
                f"<div style='padding-top:.45rem;font-size:.88rem;'>"
                f"{badge} {_tech_status_label_str(stv)}</div>",
                unsafe_allow_html=True,
            )

            # 起步价
            c_price.markdown(
                f"<div style='padding-top:.45rem;font-size:.88rem;color:#d4a843;'>"
                f"{cents_to_display(int(r['price_cents'] or 0))}</div>",
                unsafe_allow_html=True,
            )

            # 操作按钮（按状态动态显示）
            with c_ops:
                op_cols = []
                if stv == "offline":
                    op_cols = [("签到", "ci")]
                elif stv == "available":
                    op_cols = [("暂停", "pa"), ("签退", "co")]
                elif stv == "paused":
                    op_cols = [("恢复", "re"), ("签退", "co")]
                elif stv == "busy":
                    op_cols = [("签退", "co")]

                if op_cols:
                    btn_cols = st.columns(len(op_cols))
                    for bc, (label, action) in zip(btn_cols, op_cols):
                        if bc.button(label, key=f"row_{action}_{rid}",
                                     use_container_width=True):
                            cur = db.one(
                                "SELECT status FROM technicians WHERE id=?", (rid,)
                            )
                            cur_stv = str(cur["status"]) if cur else ""
                            if action == "ci" and cur_stv == "offline":
                                checkin_tech(db, rid)
                                st.session_state["_recv_tech_flash"] = t("batch_done", n=1)
                            elif action == "co" and cur_stv != "offline":
                                checkout_tech(db, rid)
                                st.session_state["_recv_tech_flash"] = t("batch_done", n=1)
                            elif action == "pa" and cur_stv == "available":
                                pause_tech(db, rid)
                                st.session_state["_recv_tech_flash"] = t("batch_done", n=1)
                            elif action == "re" and cur_stv == "paused":
                                resume_tech(db, rid)
                                st.session_state["_recv_tech_flash"] = t("batch_done", n=1)
                            else:
                                st.session_state["_recv_tech_flash"] = t("batch_no_match")
                            # 操作后重置排序为编号顺序，列表位置不乱跳
                            _reset_sort()
                            # 清除弹窗上下文，防止 rerun 后误触发资料弹窗
                            st.session_state.pop("_last_profile_ctx", None)
                            st.session_state.pop("_active_tech_profile_id", None)
                            st.rerun()

            st.markdown(
                "<hr style='margin:.15rem 0;border-color:#1e1e1e'>",
                unsafe_allow_html=True,
            )

        # ── 批量操作区 ────────────────────────────────────────
        st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)
        st.caption(f"**批量操作** · {t('tech_list_count', n=len(all_chk))}")

        def _clear_dlg_ctx() -> None:
            """批量/单行操作后清除弹窗上下文并重置排序，防止列表乱跳。"""
            st.session_state.pop("_last_profile_ctx", None)
            st.session_state.pop("_active_tech_profile_id", None)
            st.session_state.pop("_active_member_profile_id", None)
            st.session_state.pop("_active_room_detail_id", None)
            _reset_sort()

        hx1, hx2, hx3, hx4 = st.columns(4)
        with hx1:
            if st.button(t("select_all_offline"), key="recv_sel_off",
                         use_container_width=True):
                st.session_state["recv_tech_multi"] = [
                    lab for lab in labels if label_to_status[lab] == "offline"
                ]
                _clear_dlg_ctx()
                st.rerun()
        with hx2:
            if st.button(t("select_all_available"), key="recv_sel_avail",
                         use_container_width=True):
                st.session_state["recv_tech_multi"] = [
                    lab for lab in labels if label_to_status[lab] == "available"
                ]
                _clear_dlg_ctx()
                st.rerun()
        with hx3:
            if st.button(t("clear_selection"), key="recv_sel_clear",
                         use_container_width=True):
                st.session_state["recv_tech_multi"] = []
                _clear_dlg_ctx()
                st.rerun()
        with hx4:
            st.write("")  # spacer

        selected = st.multiselect(
            t("reception_batch_select"),
            options=labels,
            key="recv_tech_multi",
        )

        b1, b2, b3, b4 = st.columns(4)
        with b1:
            if st.button(f"✅ {t('batch_checkin')}", key="recv_bat_ci",
                         use_container_width=True,
                         help="仅对「休息」状态的技师有效"):
                n = 0
                for lab in selected:
                    tid = id_by_label[lab]
                    row = db.one("SELECT status FROM technicians WHERE id=?", (tid,))
                    if row and str(row["status"]) == "offline":
                        checkin_tech(db, tid)
                        n += 1
                st.session_state["_recv_tech_flash"] = (
                    t("batch_done", n=n) if n else t("batch_no_match")
                )
                _clear_dlg_ctx()
                st.rerun()
        with b2:
            if st.button(f"🚪 {t('batch_checkout')}", key="recv_bat_co",
                         use_container_width=True,
                         help="对所有非「休息」状态的技师有效"):
                n = 0
                for lab in selected:
                    tid = id_by_label[lab]
                    row = db.one("SELECT status FROM technicians WHERE id=?", (tid,))
                    if row and str(row["status"]) != "offline":
                        checkout_tech(db, tid)
                        n += 1
                st.session_state["_recv_tech_flash"] = (
                    t("batch_done", n=n) if n else t("batch_no_match")
                )
                _clear_dlg_ctx()
                st.rerun()
        with b3:
            if st.button(f"⏸ {t('batch_pause')}", key="recv_bat_pause",
                         use_container_width=True,
                         help="仅对「可接待」状态的技师有效"):
                n = 0
                for lab in selected:
                    tid = id_by_label[lab]
                    row = db.one("SELECT status FROM technicians WHERE id=?", (tid,))
                    if row and str(row["status"]) == "available":
                        pause_tech(db, tid)
                        n += 1
                st.session_state["_recv_tech_flash"] = (
                    t("batch_done", n=n) if n else t("batch_no_match")
                )
                _clear_dlg_ctx()
                st.rerun()
        with b4:
            if st.button(f"▶ {t('batch_resume')}", key="recv_bat_resume",
                         use_container_width=True,
                         help="仅对「暂停」状态的技师有效"):
                n = 0
                for lab in selected:
                    tid = id_by_label[lab]
                    row = db.one("SELECT status FROM technicians WHERE id=?", (tid,))
                    if row and str(row["status"]) == "paused":
                        resume_tech(db, tid)
                        n += 1
                st.session_state["_recv_tech_flash"] = (
                    t("batch_done", n=n) if n else t("batch_no_match")
                )
                _clear_dlg_ctx()
                st.rerun()


# ============================================================
# TAB 3: 会员管理（列表 + 编号点击 → 资料/充值弹窗）
# ============================================================
with tab_member:
    _flash_m = st.session_state.pop("_recv_member_flash", None)
    if _flash_m:
        st.success(_flash_m)

    # 顶部标题行 + 新增按钮
    th1, th2 = st.columns([4, 1])
    with th1:
        st.markdown(f"#### {t('reception_member_mgmt')}")
        st.caption("点击会员编号查看资料 · 充值入口在资料弹窗内")
    with th2:
        st.write("")
        if st.button("➕ 新增会员", key="open_new_member_dlg",
                     type="primary", use_container_width=True):
            st.session_state["_open_new_member_dlg"] = True
            st.session_state["_last_profile_ctx"] = "new_member"
            st.session_state.pop("_active_member_profile_id", None)
            st.session_state.pop("_active_tech_profile_id", None)
            st.rerun()

    st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

    all_members = _members_all_rows()
    mf = st.text_input(
        t("search"),
        key="member_list_filter_q",
        placeholder=t("member_list_filter_ph"),
    )
    mf_l = (mf or "").strip().lower()
    if mf_l:
        all_members = [
            r
            for r in all_members
            if mf_l in str(r.get("code") or "").lower()
            or mf_l in str(r.get("display_name") or "").lower()
        ]

    if not all_members:
        st.info(t("no_records"))
    else:
        PAGE_SIZE = 20
        total = len(all_members)
        total_pages = max(1, (total + PAGE_SIZE - 1) // PAGE_SIZE)

        # ── 排序选项 ──
        _SORT_OPTS = {
            "编号":              ("code",            False, "str"),
            "会员等级":          ("tier_order",      False, "int"),
            "本金余额（高→低）":  ("principal_cents", True,  "int"),
            "本金余额（低→高）":  ("principal_cents", False, "int"),
            "奖励余额（高→低）":  ("reward_cents",    True,  "int"),
            "入会时间（新→旧）":  ("created_at",      True,  "str"),
            "入会时间（旧→新）":  ("created_at",      False, "str"),
        }
        _TIER_ORDER = {"Casual": 0, "Standard": 1, "VIP": 2, "Board": 3}

        sc1, sc2 = st.columns([3, 2])
        with sc1:
            sort_by = st.selectbox(
                "排序",
                list(_SORT_OPTS.keys()),
                key="member_sort_by",
                label_visibility="collapsed",
            )
        with sc2:
            st.markdown(
                f"<div style='padding-top:.5rem;font-size:.82rem;color:#a89888;'>"
                f"共 {total} 人 · 每页 {PAGE_SIZE} 条 · 共 {total_pages} 页</div>",
                unsafe_allow_html=True,
            )

        # 排序前给每行加 tier_order 字段
        for r in all_members:
            r["tier_order"] = _TIER_ORDER.get(str(r.get("tier", "Casual")), 0)

        sort_key, sort_desc, sort_type = _SORT_OPTS[sort_by]
        if sort_type == "int":
            all_members_sorted = sorted(
                all_members,
                key=lambda x: int(x.get(sort_key) or 0),
                reverse=sort_desc,
            )
        else:
            all_members_sorted = sorted(
                all_members,
                key=lambda x: str(x.get(sort_key) or ""),
                reverse=sort_desc,
            )

        # 排序或搜索变化时自动回第 1 页，并清除弹窗上下文防止误弹
        _sort_search_sig = f"{sort_by}|{mf_l}"
        if st.session_state.get("_mb_sort_sig") != _sort_search_sig:
            st.session_state["_mb_sort_sig"] = _sort_search_sig
            st.session_state["_mb_page"] = 1
            st.session_state.pop("_last_profile_ctx", None)
            st.session_state.pop("_active_member_profile_id", None)
            st.session_state.pop("_active_tech_profile_id", None)
            st.session_state.pop("_active_room_detail_id", None)

        # 当前页码（用独立变量，不与 widget key 绑定）
        cur_page = max(1, min(int(st.session_state.get("_mb_page", 1)), total_pages))
        st.session_state["_mb_page"] = cur_page

        # 分页切片
        start = (cur_page - 1) * PAGE_SIZE
        page_rows = all_members_sorted[start: start + PAGE_SIZE]

        # ── 表头 ──
        _TIER_COLOR = {
            "Casual":   "#888",
            "Standard": "#4caf80",
            "VIP":      "#d4a843",
            "Board":    "#e05c5c",
        }
        mhdr = st.columns([1.1, 1.8, 1.3, 1.6, 1.6, 1.5, 1.8])
        for col, txt in zip(mhdr, [
            t("member_code"), t("member_name"), t("member_tier"),
            t("member_principal"), t("member_reward"),
            "入会时间", t("member_phone"),
        ]):
            col.markdown(
                f"<div style='font-size:.78rem;color:#a89888;"
                f"font-weight:700;padding-bottom:.25rem;'>{txt}</div>",
                unsafe_allow_html=True,
            )
        st.markdown(
            "<hr style='margin:.2rem 0 .4rem;border-color:#333'>",
            unsafe_allow_html=True,
        )

        # ── 每行会员（编号即点击按钮）──
        for r in page_rows:
            mc1, mc2, mc3, mc4, mc5, mc6, mc7 = st.columns([1.1, 1.8, 1.3, 1.6, 1.6, 1.5, 1.8])
            rid = int(r["id"])
            tier_color = _TIER_COLOR.get(str(r.get("tier", "Casual")), "#888")
            created_raw = str(r.get("created_at") or "")
            created_date = created_raw[:10] if len(created_raw) >= 10 else "—"

            with mc1:
                if st.button(
                    str(r["code"]),
                    key=f"mb_prof_{rid}",
                    use_container_width=True,
                    help="点击查看 / 编辑资料",
                ):
                    st.session_state["_active_member_profile_id"] = rid
                    st.session_state["_last_profile_ctx"] = "member"
                    st.session_state.pop("_active_tech_profile_id", None)
                    st.rerun()

            mc2.markdown(
                f"<div style='padding-top:.45rem;font-size:.92rem;'>"
                f"{r.get('display_name','')}</div>",
                unsafe_allow_html=True,
            )
            mc3.markdown(
                f"<div style='padding-top:.45rem;font-size:.88rem;"
                f"color:{tier_color};'>{t('tier_' + str(r.get('tier','Casual')))}</div>",
                unsafe_allow_html=True,
            )
            mc4.markdown(
                f"<div style='padding-top:.45rem;font-size:.88rem;color:#4caf80;'>"
                f"{cents_to_display(int(r.get('principal_cents') or 0))}</div>",
                unsafe_allow_html=True,
            )
            mc5.markdown(
                f"<div style='padding-top:.45rem;font-size:.88rem;color:#d4a843;'>"
                f"{cents_to_display(int(r.get('reward_cents') or 0))}</div>",
                unsafe_allow_html=True,
            )
            mc6.markdown(
                f"<div style='padding-top:.45rem;font-size:.8rem;color:#a89888;'>"
                f"{created_date}</div>",
                unsafe_allow_html=True,
            )
            mc7.markdown(
                f"<div style='padding-top:.45rem;font-size:.85rem;color:#a89888;'>"
                f"{r.get('phone') or '—'}</div>",
                unsafe_allow_html=True,
            )
            st.markdown(
                "<hr style='margin:.15rem 0;border-color:#1e1e1e'>",
                unsafe_allow_html=True,
            )

        # ── 底部翻页 ──
        bp1, bp2, bp3 = st.columns([1, 2, 1])
        with bp1:
            if st.button("◀ 上一页", key="mb_prev",
                         disabled=(cur_page <= 1),
                         use_container_width=True):
                st.session_state["_mb_page"] = cur_page - 1
                st.rerun()
        with bp2:
            st.markdown(
                f"<div style='text-align:center;padding-top:.4rem;"
                f"font-size:.85rem;color:#a89888;'>"
                f"第 {cur_page} 页 / 共 {total_pages} 页</div>",
                unsafe_allow_html=True,
            )
        with bp3:
            if st.button("下一页 ▶", key="mb_next",
                         disabled=(cur_page >= total_pages),
                         use_container_width=True):
                st.session_state["_mb_page"] = cur_page + 1
                st.rerun()

