# Changelog

## 1.0.0 — 2026-03-28

First numbered **production baseline** for Ocean Noir VMS (Streamlit ERP).

### Scope

- **前台 Reception**：开单、充值、技师与房间、批量签到等业务流程。
- **管理员中心 Boss_Center**：报表、会员、账号与系统相关能力。
- **技师展示屏 Technician_Wall**：大屏展示、筛选（全部 / 可接待）、详情与轮播。
- **首页 Home**：登录、中英切换（含 `?lang=`）、KPI 跳转展示屏。

### Technical

- SQLite 单库 `on_vms.db`，资源路径基于 `pathlib`（Windows / macOS / Linux 一致）。
- 营业日与定时逻辑：`Australia/Sydney`（见 `core/config.py`）。
- 推荐依赖：Python 3.11+，`requirements.txt` 所列包；可选安装 `bcrypt` 以获得更强密码哈希（未安装时回退 PBKDF2）。

### Migration (换机)

复制整个 `ON-VMS-2.0` 目录时，请一并带走 **`on_vms.db`** 与 **`uploads/`**（若使用技师媒体上传）。在新机器上新建虚拟环境后执行 `pip install -r requirements.txt`，从应用根目录运行 `streamlit run Home.py`。详见 `README.md`。
