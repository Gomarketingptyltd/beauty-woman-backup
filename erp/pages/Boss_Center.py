"""
Boss_Center.py — Admin & Manager control panel.
Tabs: Reports | Members | Technicians | Users | Rooms
"""
from __future__ import annotations

import pandas as pd
import streamlit as st

from core.auth import hash_password, require_role
from core.business_day import current_business_day, now_sydney
from core.config import ROLE_ADMIN, ROLE_MANAGER
from core.database import db, cents_to_display, dollars_to_cents, next_member_code
from core.i18n import t
from core.security import apply_member_pii
from core.ui import render_sidebar, back_button
from logic.billing import void_order

st.set_page_config(
    page_title="管理员中心",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

user = require_role(ROLE_ADMIN, ROLE_MANAGER)

render_sidebar("Boss_Center")

# Page header with back button
top_left, top_right = st.columns([6.2, 1.8])
with top_left:
    st.markdown(
        f"<div class='on-page-title'>📊 {t('admin_title')}</div>",
        unsafe_allow_html=True,
    )
with top_right:
    back_button(
        f"← {t('nav_home')}",
        "Home.py",
        use_container_width=True,
        key="boss_nav_home",
    )

st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

tab_report, tab_void_orders, tab_members, tab_techs, tab_users, tab_rooms = st.tabs([
    f"📈 {t('admin_reports')}",
    f"❌ {t('void_order')}",
    f"👥 {t('admin_members')}",
    f"💃 {t('admin_techs')}",
    f"🔑 {t('admin_users')}",
    f"🏠 {t('admin_rooms')}",
])


# ============================================================
# TAB 1: Reports
# ============================================================
with tab_report:
    st.markdown(f"#### {t('daily_summary')}")

    bd_default = current_business_day()
    bd_sel = st.date_input(t("business_day"), value=bd_default, key="report_bd")
    bd_str = bd_sel.isoformat()

    summary = db.one(
        """
        SELECT COUNT(*) AS order_cnt,
               COALESCE(SUM(items_total_cents), 0) AS revenue,
               COALESCE(SUM(CASE WHEN is_new_customer=1 THEN 1 ELSE 0 END), 0) AS new_customers,
               COALESCE(SUM(cashback_earned_cents), 0) AS cashback_total
        FROM orders WHERE business_day=? AND status='paid'
        """,
        (bd_str,),
    )

    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.markdown(
            f"<div class='on-metric'>"
            f"<div class='on-metric-label'>{t('revenue_total')}</div>"
            f"<div class='on-metric-value'>{cents_to_display(summary['revenue'])}</div>"
            f"</div>",
            unsafe_allow_html=True,
        )
    with m2:
        st.markdown(
            f"<div class='on-metric'>"
            f"<div class='on-metric-label'>{t('order_count')}</div>"
            f"<div class='on-metric-value'>{summary['order_cnt']}</div>"
            f"</div>",
            unsafe_allow_html=True,
        )
    with m3:
        st.markdown(
            f"<div class='on-metric'>"
            f"<div class='on-metric-label'>{t('new_members')}</div>"
            f"<div class='on-metric-value'>{summary['new_customers']}</div>"
            f"</div>",
            unsafe_allow_html=True,
        )
    with m4:
        st.markdown(
            f"<div class='on-metric'>"
            f"<div class='on-metric-label'>{t('cashback')}</div>"
            f"<div class='on-metric-value'>{cents_to_display(summary['cashback_total'])}</div>"
            f"</div>",
            unsafe_allow_html=True,
        )

    st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

    # Orders table
    orders_raw = db.all(
        """
        SELECT o.order_no, o.status, o.payment_method,
               m.code AS member_code, m.display_name AS member_name,
               tech.code AS tech_code, tech.display_name AS tech_name,
               o.items_total_cents, o.cashback_earned_cents, o.created_at
        FROM orders o
        LEFT JOIN members m ON m.id = o.member_id
        JOIN technicians tech ON tech.id = o.technician_id
        WHERE o.business_day = ?
        ORDER BY o.created_at DESC
        """,
        (bd_str,),
    )

    if not orders_raw:
        st.info(t("no_records"))
    else:
        status_map = {"paid": "✅ 已结", "voided": "❌ 冲正", "draft": "草稿"}
        pay_map    = {"cash": "现金", "member_account": "会员账户", "split": "混合"}
        display_orders = [
            {
                t("order_no"):     r["order_no"],
                t("status"):       status_map.get(r["status"], r["status"]),
                t("payment_method"): pay_map.get(r["payment_method"], r["payment_method"]),
                t("member_code"):  r["member_code"] or "",
                t("member_name"):  r["member_name"] or t("pay_cash"),
                t("tech_code"):    r["tech_code"],
                t("tech_name"):    r["tech_name"],
                t("order_total"):  cents_to_display(r["items_total_cents"]),
                t("cashback"):     cents_to_display(r["cashback_earned_cents"]),
                t("date"):         str(r["created_at"])[:16],
            }
            for r in orders_raw
        ]
        st.dataframe(
            pd.DataFrame(display_orders),
            use_container_width=True,
            hide_index=True,
        )

    # Tech commission summary
    st.markdown(f"#### {t('commission')} — 技师提成汇总")
    comm_raw = db.all(
        """
        SELECT tech.code, tech.display_name,
               COUNT(o.id) AS order_cnt,
               COALESCE(SUM(ol.commission_cents), 0) AS comm_cents
        FROM technicians tech
        LEFT JOIN orders o
          ON o.technician_id = tech.id
          AND o.business_day = ?
          AND o.status = 'paid'
        LEFT JOIN order_lines ol ON ol.order_id = o.id
        GROUP BY tech.id
        ORDER BY comm_cents DESC
        """,
        (bd_str,),
    )
    if comm_raw:
        display_comm = [
            {
                t("tech_code"):   r["code"],
                t("tech_name"):   r["display_name"],
                t("order_count"): r["order_cnt"],
                t("commission"):  cents_to_display(r["comm_cents"]),
            }
            for r in comm_raw
        ]
        st.dataframe(
            pd.DataFrame(display_comm),
            use_container_width=True,
            hide_index=True,
        )


# ============================================================
# TAB 2: 冲正（店长 / 管理员）
# ============================================================
with tab_void_orders:
    st.markdown(f"#### {t('void_order')}")
    st.caption(t("boss_void_hint"))

    bd_str = current_business_day().isoformat()
    today_orders = db.all(
        """
        SELECT o.id, o.order_no, o.status, o.items_total_cents, o.created_at,
               m.display_name AS member_name,
               tech.display_name AS tech_name
        FROM orders o
        LEFT JOIN members m ON m.id = o.member_id
        JOIN technicians tech ON tech.id = o.technician_id
        WHERE o.business_day = ? AND o.status = 'paid'
        ORDER BY o.created_at DESC
        """,
        (bd_str,),
    )

    if not today_orders:
        st.info(t("no_records"))
    else:
        void_opts = {
            f"{r['order_no']} — {cents_to_display(r['items_total_cents'])} "
            f"({r['member_name'] or '现金客'} / {r['tech_name']})": r["id"]
            for r in today_orders
        }
        vk = list(void_opts.keys())
        v_pick = st.radio(
            t("order_no"),
            vk,
            key="boss_void_order_radio",
        )
        void_id = void_opts.get(v_pick)

        void_reasons = [
            "客户要求取消", "技师不可用", "房间故障",
            "重复录入", "价格错误", "其他",
        ]
        reason = st.radio(
            t("void_reason"),
            void_reasons,
            key="boss_void_reason_radio",
            horizontal=False,
        )
        extra_note = st.text_input(t("note"), key="boss_void_note")
        reason_full = f"{reason}：{extra_note}" if extra_note else reason

        if st.button(t("void_order"), key="boss_do_void", type="primary"):
            try:
                void_order(
                    database=db,
                    order_id=void_id,
                    voided_by=user.id,
                    reason_code=reason_full,
                )
                st.success(t("void_success"))
                st.rerun()
            except ValueError as e:
                msg = str(e)
                if msg == "void_deadline_passed":
                    st.error(t("void_expired"))
                else:
                    st.error(f"{t('error')}: {msg}")


# ============================================================
# TAB 3: Members
# ============================================================
with tab_members:
    st.markdown(f"#### {t('admin_members')}")

    qm = st.text_input(t("member_search"), key="admin_member_q",
                       placeholder="编号 或 姓名，留空显示全部")
    if qm:
        base = db.all(
            "SELECT * FROM members WHERE code LIKE ? OR display_name LIKE ? "
            "ORDER BY code LIMIT 50",
            (f"%{qm}%", f"%{qm}%"),
        )
    else:
        base = db.all("SELECT * FROM members ORDER BY code LIMIT 100")

    rows_disp = [apply_member_pii(dict(r), user.role) for r in base]

    if rows_disp:
        display_members = [
            {
                t("member_code"):          r["code"],
                t("member_name"):          r["display_name"],
                t("member_tier"):          t(f"tier_{r['tier']}"),
                t("member_principal"):     cents_to_display(r["principal_cents"]),
                t("member_reward"):        cents_to_display(r["reward_cents"]),
                t("member_phone"):         r.get("phone") or "",
                t("member_contact_other"): r.get("contact_other") or "",
                t("member_notes"):         r.get("notes") or "",
            }
            for r in rows_disp
        ]
        st.dataframe(
            pd.DataFrame(display_members),
            use_container_width=True,
            hide_index=True,
        )
    else:
        st.info(t("no_records"))

    st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

    # Edit member
    with st.expander(f"✏️ 编辑会员资料"):
        edit_code = st.text_input(f"{t('member_code')}（精确）", key="edit_m_code")
        if edit_code:
            mrow = db.one("SELECT * FROM members WHERE code=?", (edit_code.strip(),))
            if mrow:
                m = dict(mrow)
                with st.form("edit_member_form"):
                    e_name  = st.text_input(t("member_name"), value=m["display_name"])
                    e_phone = st.text_input(t("member_phone"), value=m["phone"] or "")
                    e_cont  = st.text_input(
                        t("member_contact_other"), value=m["contact_other"] or ""
                    )
                    e_tier  = st.selectbox(
                        t("member_tier"),
                        ["Casual", "Standard", "VIP", "Board"],
                        index=["Casual", "Standard", "VIP", "Board"].index(m["tier"]),
                        format_func=lambda x: t(f"tier_{x}"),
                    )
                    e_note  = st.text_area(t("member_notes"), value=m["notes"] or "")
                    e_save  = st.form_submit_button(t("save"), use_container_width=True)
                if e_save:
                    db.execute(
                        "UPDATE members SET display_name=?,phone=?,contact_other=?,"
                        "tier=?,notes=? WHERE id=?",
                        (e_name, e_phone, e_cont, e_tier, e_note, m["id"]),
                    )
                    st.success(t("success"))
                    st.rerun()
            else:
                st.warning("找不到该会员")

    # Manual balance adjustment (admin only)
    if user.role == ROLE_ADMIN:
        with st.expander("💰 手动余额调整（管理员）"):
            adj_code = st.text_input(t("member_code"), key="adj_code")
            if adj_code:
                adj_row = db.one(
                    "SELECT * FROM members WHERE code=?", (adj_code.strip(),)
                )
                if adj_row:
                    st.markdown(
                        f"<div class='on-card' style='padding:.6rem 1rem;'>"
                        f"当前余额 — 本金：<b style='color:#4caf80'>"
                        f"{cents_to_display(adj_row['principal_cents'])}</b>"
                        f" &ensp; 奖励：<b style='color:#d4a843'>"
                        f"{cents_to_display(adj_row['reward_cents'])}</b>"
                        f"</div>",
                        unsafe_allow_html=True,
                    )
                    adj_principal = st.number_input(
                        t("adj_principal_aud"), step=1.0, key="adj_p"
                    )
                    adj_reward = st.number_input(
                        t("adj_reward_aud"), step=1.0, key="adj_r"
                    )
                    adj_note = st.text_input("原因", key="adj_note")
                    if st.button("确认调整", key="do_adj", type="primary"):
                        p_cents = dollars_to_cents(adj_principal)
                        r_cents = dollars_to_cents(adj_reward)
                        now_str = now_sydney().isoformat()
                        conn = db.connect()
                        try:
                            conn.execute(
                                "UPDATE members SET principal_cents=principal_cents+?,"
                                " reward_cents=reward_cents+? WHERE id=?",
                                (p_cents, r_cents, adj_row["id"]),
                            )
                            conn.execute(
                                "INSERT INTO ledger "
                                "(member_id,tx_type,principal_delta,reward_delta,"
                                "note,created_by,created_at) VALUES (?,?,?,?,?,?,?)",
                                (adj_row["id"], "adjust", p_cents, r_cents,
                                 adj_note, user.id, now_str),
                            )
                            conn.execute(
                                "INSERT INTO audit_log "
                                "(table_name,record_id,action,field_name,"
                                "old_value,new_value,performed_by,performed_at) "
                                "VALUES ('members',?,?,?,?,?,?,?)",
                                (adj_row["id"], "ADJUST", "balance",
                                 f"p:{adj_row['principal_cents']},r:{adj_row['reward_cents']}",
                                 f"p:{adj_row['principal_cents']+p_cents},"
                                 f"r:{adj_row['reward_cents']+r_cents}",
                                 user.id, now_str),
                            )
                            conn.commit()
                        finally:
                            conn.close()
                        st.success(t("success"))
                        st.rerun()
                else:
                    st.warning("找不到该会员")


# ============================================================
# TAB 4: Technicians
# ============================================================
with tab_techs:
    st.markdown(f"#### {t('admin_techs')}")

    all_t = db.all("SELECT * FROM technicians ORDER BY code")
    if all_t:
        status_map_t = {
            "available": t("tech_available"),
            "busy":      t("tech_busy"),
            "offline":   t("tech_offline"),
            "paused":    t("tech_paused"),
        }
        display_techs = [
            {
                t("tech_code"):        r["code"],
                t("tech_name"):        r["display_name"],
                t("status"):           status_map_t.get(r["status"], r["status"]),
                t("tech_specialty"):   r.get("specialty") or "",
                t("tech_nationality"): r.get("nationality") or "",
                t("tech_price"):       cents_to_display(r["price_cents"] or 0),
                t("tech_languages"):   r.get("languages") or "",
            }
            for r in all_t
        ]
        st.dataframe(
            pd.DataFrame(display_techs),
            use_container_width=True,
            hide_index=True,
        )

    st.info(f"💡 {t('admin_tech_add_at_reception')}")

    st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

    with st.expander(f"✏️ 编辑技师"):
        et_code = st.text_input(f"{t('tech_code')}（精确）", key="et_code")
        if et_code:
            et_row = db.one(
                "SELECT * FROM technicians WHERE code=?", (et_code.strip(),)
            )
            if et_row:
                tr = dict(et_row)
                with st.form("edit_tech_form"):
                    et_name   = st.text_input(t("tech_name"), value=tr["display_name"])
                    et_spec   = st.text_input(
                        t("tech_specialty"), value=tr["specialty"] or ""
                    )
                    et_nation = st.text_input(
                        t("tech_nationality"), value=tr["nationality"] or ""
                    )
                    et_lang   = st.text_input(
                        t("tech_languages"), value=tr["languages"] or ""
                    )
                    col_eh, col_ew = st.columns(2)
                    with col_eh:
                        et_h = st.number_input(
                            f"{t('tech_height')} (cm)",
                            value=float(tr["height_cm"] or 0), step=1.0,
                        )
                    with col_ew:
                        et_w = st.number_input(
                            f"{t('tech_weight')} (kg)",
                            value=float(tr["weight_kg"] or 0), step=0.5,
                        )
                    et_bust   = st.text_input(t("tech_bust"), value=tr["bust"] or "")
                    et_price  = st.number_input(
                        t("tech_price_aud"),
                        value=float((tr["price_cents"] or 0) / 100), step=5.0,
                    )
                    et_bio    = st.text_area("简介", value=tr["bio"] or "")
                    et_active = st.checkbox("在职", value=bool(tr["is_active"]))
                    et_save   = st.form_submit_button(t("save"), use_container_width=True)
                if et_save:
                    db.execute(
                        """UPDATE technicians
                           SET display_name=?,specialty=?,nationality=?,
                               languages=?,height_cm=?,weight_kg=?,bust=?,
                               price_cents=?,bio=?,is_active=?
                           WHERE id=?""",
                        (et_name, et_spec, et_nation, et_lang,
                         et_h or None, et_w or None, et_bust,
                         dollars_to_cents(et_price), et_bio,
                         1 if et_active else 0, tr["id"]),
                    )
                    st.success(t("success"))
                    st.rerun()
            else:
                st.warning("找不到该技师编号")


# ============================================================
# TAB 5: Users
# ============================================================
with tab_users:
    st.markdown(f"#### {t('admin_users')}")

    all_u = db.all(
        "SELECT id, username, role, display_name, is_active FROM users ORDER BY id"
    )
    if all_u:
        display_users = [
            {
                "ID":           r["id"],
                t("username"):  r["username"],
                t("role"):      t(f"role_{r['role']}"),
                "显示名称":     r["display_name"],
                "在职":         "✅" if r["is_active"] else "❌",
            }
            for r in all_u
        ]
        st.dataframe(
            pd.DataFrame(display_users),
            use_container_width=True,
            hide_index=True,
        )

    st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)

    if user.role == ROLE_ADMIN:
        with st.expander(f"➕ 新增账号"):
            with st.form("add_user_form"):
                nu_user  = st.text_input(f"{t('username')} *")
                nu_pwd   = st.text_input(f"{t('password')} *", type="password")
                nu_role  = st.selectbox(
                    t("role"),
                    ["ADMIN", "MANAGER", "STAFF", "TECH"],
                    format_func=lambda x: t(f"role_{x}"),
                )
                nu_dname = st.text_input("显示名称")
                nu_save  = st.form_submit_button(t("add"), use_container_width=True)
            if nu_save:
                if not nu_user.strip() or not nu_pwd.strip():
                    st.error("用户名和密码不能为空")
                else:
                    try:
                        db.execute(
                            "INSERT INTO users "
                            "(username,password_hash,role,display_name) VALUES (?,?,?,?)",
                            (nu_user.strip(), hash_password(nu_pwd), nu_role, nu_dname),
                        )
                        st.success(t("success"))
                        st.rerun()
                    except Exception as e:
                        st.error(f"创建失败：{e}")

    with st.expander(f"🔑 {t('change_password')}"):
        with st.form("change_pwd_form"):
            cp_old = st.text_input(t("old_password"), type="password")
            cp_new = st.text_input(t("new_password"), type="password")
            cp_cfm = st.text_input(t("confirm_password"), type="password")
            cp_save = st.form_submit_button(t("save"), use_container_width=True)
        if cp_save:
            from core.auth import verify_password
            cur = db.one("SELECT password_hash FROM users WHERE id=?", (user.id,))
            if not cur or not verify_password(cp_old, str(cur["password_hash"])):
                st.error("旧密码错误")
            elif cp_new != cp_cfm:
                st.error(t("password_mismatch"))
            elif len(cp_new) < 6:
                st.error("新密码至少 6 位")
            else:
                db.execute(
                    "UPDATE users SET password_hash=? WHERE id=?",
                    (hash_password(cp_new), user.id),
                )
                st.success(t("password_changed"))


# ============================================================
# TAB 6: Rooms
# ============================================================
with tab_rooms:
    st.markdown(f"#### {t('admin_rooms')}")

    room_rows = db.all("SELECT * FROM rooms ORDER BY room_type, code")
    if room_rows:
        display_rooms = [
            {
                "编号":      r["code"],
                "房型":      t(f"room_{r['room_type']}"),
                t("status"): t(f"room_{r['status']}"),
                "更新时间":  str(r["updated_at"] or "")[:16],
            }
            for r in room_rows
        ]
        st.dataframe(
            pd.DataFrame(display_rooms),
            use_container_width=True,
            hide_index=True,
        )
    else:
        st.info(t("no_records"))

    st.markdown("<hr class='on-divider'>", unsafe_allow_html=True)
    st.markdown(f"**快速更改房态**")

    room_codes = {r["code"]: r["id"] for r in room_rows} if room_rows else {}
    if room_codes:
        rc1, rc2, rc3 = st.columns([1.5, 1.5, 1])
        with rc1:
            sel_room = st.selectbox(
                "选择房间", list(room_codes.keys()), key="room_status_sel"
            )
        with rc2:
            new_status = st.selectbox(
                "新状态",
                ["free", "occupied", "cleaning", "maintenance"],
                format_func=lambda x: t(f"room_{x}"),
                key="room_new_status",
            )
        with rc3:
            st.markdown("<div style='margin-top:1.7rem;'></div>", unsafe_allow_html=True)
            if st.button("更新房态", key="update_room", type="primary",
                         use_container_width=True):
                db.execute(
                    "UPDATE rooms SET status=?, updated_at=?, updated_by=? WHERE id=?",
                    (new_status, now_sydney().isoformat(), user.id, room_codes[sel_room]),
                )
                st.success(t("success"))
                st.rerun()
    else:
        st.info(t("no_records"))
