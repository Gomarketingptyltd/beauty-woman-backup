"""
i18n — Bilingual translation utility  (Chinese / English)
Default language: zh (Chinese)
"""
from __future__ import annotations

import streamlit as st

# ---------------------------------------------------------------------------
# Translation dictionary
# All strings should have 'zh' and 'en' keys.
# ---------------------------------------------------------------------------

_TRANS: dict[str, dict[str, str]] = {
    # --- App wide ---
    "app_name":                 {"zh": "夜色宫管理系统",           "en": "Ocean Noir VMS"},
    "welcome":                  {"zh": "欢迎",                    "en": "Welcome"},
    "language":                 {"zh": "语言",                    "en": "Language"},
    "logout":                   {"zh": "退出登录",                 "en": "Sign Out"},
    "login":                    {"zh": "登录",                    "en": "Sign In"},
    "username":                 {"zh": "用户名",                   "en": "Username"},
    "password":                 {"zh": "密码",                    "en": "Password"},
    "login_btn":                {"zh": "登 录",                   "en": "Sign In"},
    "login_fail":               {"zh": "用户名或密码错误",           "en": "Invalid username or password"},
    "logged_in_as":             {"zh": "当前用户",                 "en": "Signed in as"},
    "role":                     {"zh": "角色",                    "en": "Role"},
    "save":                     {"zh": "保存",                    "en": "Save"},
    "cancel":                   {"zh": "取消",                    "en": "Cancel"},
    "confirm":                  {"zh": "确认",                    "en": "Confirm"},
    "delete":                   {"zh": "删除",                    "en": "Delete"},
    "edit":                     {"zh": "编辑",                    "en": "Edit"},
    "add":                      {"zh": "新增",                    "en": "Add"},
    "search":                   {"zh": "搜索",                    "en": "Search"},
    "back":                     {"zh": "返回",                    "en": "Back"},
    "close":                    {"zh": "关闭",                    "en": "Close"},
    "success":                  {"zh": "操作成功",                 "en": "Success"},
    "error":                    {"zh": "操作失败",                 "en": "Error"},
    "no_records":               {"zh": "暂无记录",                 "en": "No records"},
    "loading":                  {"zh": "加载中…",                  "en": "Loading…"},
    "amount":                   {"zh": "金额",                    "en": "Amount"},
    "balance":                  {"zh": "余额",                    "en": "Balance"},
    "note":                     {"zh": "备注",                    "en": "Note"},
    "date":                     {"zh": "日期",                    "en": "Date"},
    "business_day":             {"zh": "营业日",                   "en": "Business Day"},
    "status":                   {"zh": "状态",                    "en": "Status"},
    "actions":                  {"zh": "操作",                    "en": "Actions"},

    # --- Navigation ---
    "nav_home":                 {"zh": "首页",                    "en": "Home"},
    "nav_reception":            {"zh": "前台",                    "en": "Reception"},
    "nav_tech_wall":            {"zh": "展示屏",                  "en": "Tech Wall"},
    "nav_admin":                {"zh": "管理员中心",               "en": "Admin Center"},

    # --- Login page ---
    "login_title":              {"zh": "夜色宫 · 员工登录",        "en": "Ocean Noir — Staff Login"},
    "login_subtitle":           {"zh": "请输入您的账号和密码",       "en": "Enter your credentials"},

    # --- Home page ---
    "home_title":               {"zh": "夜色宫管理系统",           "en": "Ocean Noir VMS"},
    "home_subtitle":            {"zh": "请选择操作区域",           "en": "Select an area to continue"},
    "home_bd":                  {"zh": "今日营业日",               "en": "Today's Business Day"},

    # --- Reception ---
    "reception_title":          {"zh": "前台开单",                 "en": "Reception"},
    "reception_new_tech":       {"zh": "新增技师",                 "en": "Add Technician"},
    "reception_tech_list":      {"zh": "技师列表",                 "en": "Technician List"},
    "reception_tech_list_hint": {
        "zh": "多选后批量操作；展示屏仅展示。",
        "en": "Multi-select and batch actions; the Tech Wall is display-only.",
    },
    "reception_batch_select":   {"zh": "选择技师（可多选）",        "en": "Select technician(s)"},
    "batch_checkin":            {"zh": "批量签到",                 "en": "Batch check-in"},
    "batch_checkout":           {"zh": "批量签退",                 "en": "Batch check-out"},
    "batch_pause":              {"zh": "批量暂停接客",             "en": "Batch pause"},
    "batch_resume":             {"zh": "批量恢复接客",             "en": "Batch resume"},
    "select_all_offline":       {"zh": "全选休息中",               "en": "Select all off duty"},
    "select_all_available":     {"zh": "全选可接待",               "en": "Select all available"},
    "clear_selection":          {"zh": "清空选择",                 "en": "Clear"},
    "batch_done":               {"zh": "已处理 {n} 人",            "en": "Processed {n}"},
    "batch_no_match":           {"zh": "无符合该操作状态的人员",  "en": "No technicians in the required status"},
    "tech_list_count":          {"zh": "共 {n} 人",               "en": "{n} total"},
    "reception_new_tech_caption": {
        "zh": "新技师默认「休息」。请到「技师列表」分页批量或单个签到后进入排队。",
        "en": "New techs start Off Duty. Check in under Technician List.",
    },
    "admin_tech_add_at_reception": {
        "zh": "新增技师请在前台「新增技师」分页登记。",
        "en": "To add a technician, use Reception → Add Technician.",
    },
    "tech_bio_short":           {"zh": "简介",                    "en": "Bio"},
    "new_order":                {"zh": "新建订单",                 "en": "New Order"},
    "member_search":            {"zh": "会员查询",                 "en": "Member Lookup"},
    "reception_member_mgmt":    {"zh": "会员管理",                 "en": "Member Management"},
    "reception_member_list":    {"zh": "会员列表",                 "en": "Member List"},
    "reception_member_list_hint": {
        "zh": "以下为全部会员，可用搜索框筛选；新增会员在下方。",
        "en": "All members below; use the filter box. Add new members below.",
    },
    "reception_member_mgmt_hint": {
        "zh": "会员列表、充值与新增会员；点击编号查看资料。",
        "en": "Member list, top-up, and add member; tap a member code for profile.",
    },
    "click_code_profile":       {"zh": "点击编号查看个人资料",      "en": "Tap a code to open profile"},
    "profile_member_title":     {"zh": "会员资料",                 "en": "Member profile"},
    "profile_tech_title":       {"zh": "技师资料",                 "en": "Technician profile"},
    "profile_open":             {"zh": "资料",                    "en": "Profile"},
    "tech_media_upload":        {"zh": "上传照片或视频",           "en": "Upload photos or videos"},
    "tech_media_limit":         {"zh": "最多 {n} 个文件",          "en": "Up to {n} files"},
    "tech_media_max":           {"zh": "已达上传上限（10 个）",     "en": "Maximum 10 files reached"},
    "tech_media_delete":        {"zh": "删除",                    "en": "Delete"},
    "tech_media_none":          {"zh": "暂无媒体文件",             "en": "No media yet"},
    "boss_void_hint":           {"zh": "仅店长/管理员可冲正当日已收款开单订单。", "en": "Managers/admins only: void paid orders for the business day."},
    "member_list_filter_ph":    {"zh": "按编号或姓名筛选会员…",     "en": "Filter members by code or name…"},
    "member_name_required":     {"zh": "姓名不能为空",              "en": "Name is required"},
    "dialog_congrats_title":    {"zh": "恭喜添加成功",             "en": "Added successfully"},
    "dialog_congrats_member":   {
        "zh": "会员已成功建档。\n\n编号：**{code}**\n姓名：**{name}**",
        "en": "Member created.\n\nID: **{code}**\nName: **{name}**",
    },
    "dialog_congrats_tech":     {
        "zh": "技师已成功登记。\n\n编号：**{code}**\n姓名：**{name}**",
        "en": "Technician added.\n\nID: **{code}**\nName: **{name}**",
    },
    "reception_directory":      {"zh": "名录",                    "en": "Directory"},
    "reception_directory_hint": {
        "zh": "会员与技师总览（只读）；详细操作请使用「会员列表」「技师列表」。",
        "en": "Read-only overview; use Member List or Technician List for actions.",
    },
    "member_code":              {"zh": "会员编号",                 "en": "Member ID"},
    "member_name":              {"zh": "会员姓名",                 "en": "Member Name"},
    "member_tier":              {"zh": "会员等级",                 "en": "Tier"},
    "member_phone":             {"zh": "手机号",                  "en": "Phone"},
    "member_contact_other":     {"zh": "其他联系方式",              "en": "Other Contact"},
    "member_notes":             {"zh": "备注",                    "en": "Notes"},
    "member_principal":         {"zh": "本金余额",                 "en": "Principal Balance"},
    "member_reward":            {"zh": "奖励余额",                 "en": "Reward Balance"},
    "topup":                    {"zh": "充值",                    "en": "Top-Up"},
    "topup_amount":             {"zh": "充值金额（澳元）",           "en": "Amount to Top-Up (AUD)"},
    "topup_success":            {"zh": "充值成功",                 "en": "Top-up successful"},
    "payment_method":           {"zh": "付款方式",                 "en": "Payment Method"},
    "pay_cash":                 {"zh": "现金收款",                 "en": "Cash Payment"},
    "pay_member":               {"zh": "会员账户",                 "en": "Member Account"},
    "pay_new_customer":         {"zh": "新客人（现结）",            "en": "New Customer (Cash)"},
    "order_items":              {"zh": "服务项目",                 "en": "Order Items"},
    "item_name":                {"zh": "项目名称",                 "en": "Item"},
    "item_price":               {"zh": "单价（澳元）",              "en": "Unit Price (AUD)"},
    "item_qty":                 {"zh": "数量",                    "en": "Qty"},
    "item_total":               {"zh": "小计",                    "en": "Subtotal"},
    "order_total":              {"zh": "合计",                    "en": "Total"},
    "cashback":                 {"zh": "消费返利",                 "en": "Cashback"},
    "commission":               {"zh": "提成",                    "en": "Commission"},
    "select_tech":              {"zh": "选择技师",                 "en": "Select Technician"},
    "tech_rotation_mode":       {"zh": "轮牌排班",                 "en": "Rotation queue"},
    "tech_none_available":      {"zh": "暂无可用技师",             "en": "No technician available"},
    "tech_pick_hint":           {"zh": "请点选一位技师",            "en": "Tap a technician below"},
    "tech_rotation_short":      {"zh": "轮牌",                    "en": "Queue"},
    "select_room":              {"zh": "选择房间",                 "en": "Select Room"},
    "referrer_code":            {"zh": "推荐人编号（可选）",         "en": "Referrer Code (optional)"},
    "confirm_order":            {"zh": "确认收款并开单",            "en": "Confirm payment & start service"},
    "order_success_paid":       {
        "zh": "✅ **收款成功，服务已开始**！单号：**{order_no}**  合计：{total}",
        "en": "✅ **Payment received — service started.** Order **{order_no}**  Total: {total}",
    },
    "order_insufficient_balance": {
        "zh": "会员余额不足，无法开单",
        "en": "Insufficient balance; cannot start service.",
    },
    "order_failed_prefix":      {"zh": "开单失败：",               "en": "Order failed: "},
    "room_grid_hint_service":   {
        "zh": "先收款再开单；收款完成表示服务开始。房间占用至该技师签退后恢复空闲。",
        "en": "Payment first; paying starts the service. Room stays occupied until the technician checks out.",
    },
    "room_grid_hint_click":     {
        "zh": "点击空闲房间选中；再次点击取消；使用中房间点击查看详情。",
        "en": "Tap a free room to select; tap again to clear. Tap an occupied room for details.",
    },
    "order_no":                 {"zh": "单号",                    "en": "Order No."},
    "void_order":               {"zh": "冲正",                    "en": "Void Order"},
    "void_reason":              {"zh": "冲正原因",                 "en": "Void Reason"},
    "void_success":             {"zh": "冲正成功",                 "en": "Order voided"},
    "void_expired":             {"zh": "超出当日营业日，无法冲正",    "en": "Void window has passed"},
    "void_no_perm":             {"zh": "无冲正权限（需管理员）",      "en": "Insufficient permissions for void"},
    "is_new_customer":          {"zh": "新客人？",                 "en": "New Customer?"},

    # --- Technician Wall ---
    "tech_wall_title":          {"zh": "技师展示",                 "en": "Technician Wall"},
    "tech_wall_readonly":       {
        "zh": "仅展示状态与排队，不可操作。签到请至前台「技师列表」。",
        "en": "Display only. Use Reception → Technician List to change status.",
    },
    "tech_wall_search_placeholder": {
        "zh": "按编号或姓名筛选…",
        "en": "Filter by code or name…",
    },
    "tech_wall_page_prev":      {"zh": "上一页",                  "en": "Previous"},
    "tech_wall_page_next":      {"zh": "下一页",                  "en": "Next"},
    "tech_wall_page_info":      {"zh": "第 {cur}/{total} 页 · 共 {n} 人", "en": "Page {cur}/{total} · {n} techs"},
    "tech_wall_back_home":      {"zh": "← 首页",                  "en": "← Home"},
    "tech_wall_view_photos":    {"zh": "查看全部照片",              "en": "View All Photos"},
    "tech_wall_close_detail":   {"zh": "← 返回列表",               "en": "← Back"},
    "tech_wall_photo_of":       {"zh": "{cur} / {total}",         "en": "{cur} / {total}"},
    "tech_wall_slideshow":      {"zh": "轮播中，触屏返回",           "en": "Slideshow · Touch to return"},
    "tech_available":           {"zh": "可接待",                  "en": "Available"},
    "tech_busy":                {"zh": "服务中",                  "en": "In Service"},
    "tech_offline":             {"zh": "休息",                    "en": "Off Duty"},
    "tech_paused":              {"zh": "暂停",                    "en": "Paused"},
    "tech_checkin":             {"zh": "签到",                    "en": "Check In"},
    "tech_checkout":            {"zh": "签退",                    "en": "Check Out"},
    "tech_pause":               {"zh": "暂停接客",                 "en": "Pause"},
    "tech_resume":              {"zh": "恢复接客",                 "en": "Resume"},
    "tech_code_name_required":  {"zh": "编号和姓名为必填项",        "en": "Code and name are required"},
    "tech_code":                {"zh": "技师编号",                 "en": "Tech ID"},
    "tech_name":                {"zh": "技师姓名",                 "en": "Name"},
    "tech_specialty":           {"zh": "专长",                    "en": "Specialty"},
    "tech_price":               {"zh": "起步价",                  "en": "Base Price"},
    "tech_price_aud":           {"zh": "起步价（澳元）",           "en": "Base Price (AUD)"},
    "adj_principal_aud":        {"zh": "本金调整（澳元，正=增 负=减）", "en": "Principal Δ (AUD)"},
    "adj_reward_aud":         {"zh": "奖励调整（澳元，正=增 负=减）", "en": "Reward Δ (AUD)"},
    "tech_nationality":         {"zh": "国籍",                    "en": "Nationality"},
    "tech_height":              {"zh": "身高",                    "en": "Height"},
    "tech_weight":              {"zh": "体重",                    "en": "Weight"},
    "tech_bust":                {"zh": "三围",                    "en": "Measurements"},
    "tech_languages":           {"zh": "语言",                    "en": "Languages"},
    "queue_position":           {"zh": "排队顺序",                 "en": "Queue Position"},

    # --- Admin Center ---
    "admin_title":              {"zh": "管理员中心",               "en": "Admin Center"},
    "admin_reports":            {"zh": "经营报表",                 "en": "Reports"},
    "admin_members":            {"zh": "会员管理",                 "en": "Members"},
    "admin_techs":              {"zh": "技师管理",                 "en": "Technicians"},
    "admin_users":              {"zh": "账号管理",                 "en": "Users"},
    "admin_rooms":              {"zh": "房态管理",                 "en": "Rooms"},
    "daily_summary":            {"zh": "当日汇总",                 "en": "Daily Summary"},
    "revenue_total":            {"zh": "总营业额",                 "en": "Total Revenue"},
    "order_count":              {"zh": "订单数",                  "en": "Order Count"},
    "new_members":              {"zh": "新会员",                  "en": "New Members"},
    "change_password":          {"zh": "修改密码",                 "en": "Change Password"},
    "old_password":             {"zh": "旧密码",                  "en": "Old Password"},
    "new_password":             {"zh": "新密码",                  "en": "New Password"},
    "confirm_password":         {"zh": "确认新密码",               "en": "Confirm New Password"},
    "password_mismatch":        {"zh": "两次密码不一致",            "en": "Passwords do not match"},
    "password_changed":         {"zh": "密码修改成功",             "en": "Password changed"},

    # --- Roles labels ---
    "role_ADMIN":               {"zh": "管理员",                  "en": "Admin"},
    "role_MANAGER":             {"zh": "店长",                    "en": "Manager"},
    "role_STAFF":               {"zh": "前台",                    "en": "Staff"},
    "role_TECH":                {"zh": "技师",                    "en": "Technician"},

    # --- Tiers ---
    "tier_Casual":              {"zh": "普通会员",                 "en": "Casual"},
    "tier_Standard":            {"zh": "高级会员",                 "en": "Standard"},
    "tier_VIP":                 {"zh": "VIP 会员",                "en": "VIP"},
    "tier_Board":               {"zh": "董事会员",                 "en": "Board"},

    # --- Room types ---
    "room_service":             {"zh": "服务间",                  "en": "Service Room"},
    "room_waiting":             {"zh": "等候区",                  "en": "Waiting Area"},
    "room_public":              {"zh": "公共区",                  "en": "Public Area"},
    "room_free":                {"zh": "空闲",                    "en": "Free"},
    "room_occupied":            {"zh": "使用中",                  "en": "Occupied"},
    "room_cleaning":            {"zh": "清洁中",                  "en": "Cleaning"},
    "room_maintenance":         {"zh": "维修中",                  "en": "Maintenance"},

    "room_pick":                {"zh": "选择",                    "en": "Select"},
    "room_stale":               {"zh": "该房间已不可选，请另选空闲房间。", "en": "This room is no longer available; pick another."},
    "room_grid_hint":           {"zh": "仅「空闲」房间可点选；金色描边为当前已选。", "en": "Only free rooms are selectable; gold outline = selected."},
    "room_none_in_db":          {"zh": "系统中暂无房间数据。",        "en": "No rooms configured."},
    "room_no_free":             {"zh": "当前没有空闲房间。",          "en": "No free rooms available."},

    # --- Login page branding ---
    "login_brand_zh":           {"zh": "夜色宫",                    "en": "Ocean Noir"},
    "login_brand_en":           {"zh": "OCEAN NOIR",               "en": "OCEAN NOIR"},
    "login_brand_sub":          {"zh": "Sydney · Est. 2010",        "en": "Sydney · Est. 2010"},
    "login_wall_btn":           {"zh": "🖥  技师展示屏",              "en": "🖥  Technician Wall"},
    "login_wall_sub":           {"zh": "无需登录，实时查看技师状态",   "en": "Live technician status — no login required"},
    "login_staff_title":        {"zh": "员工登录",                   "en": "Staff Login"},
    "login_welcome_short":      {"zh": "欢迎登录",                   "en": "Welcome"},
    "login_enter_credentials":  {"zh": "请输入您的账号和密码",        "en": "Enter your account and password"},
    "login_ph_username":        {"zh": "请输入用户名",               "en": "Username"},
    "login_ph_password":        {"zh": "请输入密码",                "en": "Password"},
    "login_error_empty":        {"zh": "请输入用户名和密码",          "en": "Please enter username and password"},
    "login_stat_total":         {"zh": "技师总数",                   "en": "Total technicians"},
    "login_stat_available":     {"zh": "可接待技师",                 "en": "Available now"},
    "login_chart_title":        {"zh": "近期每日平均客流量",          "en": "Average daily traffic (sample)"},
    "login_chart_hint":         {
        "zh": "为了更好的服务您，请留意繁忙与非繁忙时间段",
        "en": "For your convenience, note busier vs quieter periods.",
    },
    "tech_wall_filter_all":     {"zh": "全部技师",                   "en": "All technicians"},
    "tech_wall_filter_avail":   {"zh": "仅可接待",                   "en": "Available only"},
    "tech_wall_queue_pos":      {"zh": "#{n} 排队",                 "en": "Queue #{n}"},
}


# ---------------------------------------------------------------------------
# Session language helpers
# ---------------------------------------------------------------------------

SUPPORTED = ["zh", "en"]
LANG_LABELS = {"zh": "中文", "en": "English"}


def get_lang() -> str:
    return st.session_state.get("_lang", "zh")


def set_lang(lang: str) -> None:
    if lang in SUPPORTED:
        st.session_state["_lang"] = lang


def toggle_lang_session() -> None:
    """Flip UI language zh ↔ en (use as st.button on_click)."""
    cur = st.session_state.get("_lang", "zh")
    if cur not in SUPPORTED:
        cur = "zh"
    st.session_state["_lang"] = "en" if cur == "zh" else "zh"


def consume_lang_query_param() -> bool:
    """
    Apply ?lang=zh|en into session and remove it from the URL.
    Returns True if a rerun is recommended (e.g. to refresh page_title).
    """
    if "lang" not in st.query_params:
        return False
    raw = st.query_params.get("lang")
    if isinstance(raw, list):
        raw = raw[0] if raw else ""
    lv = (str(raw) if raw is not None else "").lower()
    if lv not in SUPPORTED:
        try:
            st.query_params.pop("lang", None)
        except (TypeError, AttributeError, KeyError):
            try:
                del st.query_params["lang"]
            except Exception:
                pass
        return False
    st.session_state["_lang"] = lv
    try:
        st.query_params.pop("lang", None)
    except (TypeError, AttributeError, KeyError):
        try:
            del st.query_params["lang"]
        except Exception:
            pass
    return True


def t(key: str, **kwargs: str) -> str:
    """
    Translate `key` in the current language.
    Falls back to key itself if missing.
    """
    lang = get_lang()
    entry = _TRANS.get(key)
    if not entry:
        return key
    result = entry.get(lang, entry.get("zh", key))
    if kwargs:
        try:
            result = result.format(**kwargs)
        except KeyError:
            pass
    return result
