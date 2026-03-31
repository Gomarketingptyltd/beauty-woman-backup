# Ocean Noir VMS — ON-VMS 2.0

**Version:** see `VERSION` (current **1.0.0**).

Streamlit-based venue management: reception, admin, technician wall, members & billing (AUD / cents in DB).

## Requirements

- **Python 3.11+** (recommended; 3.9+ may work)
- macOS, Windows, or Linux

## Quick start

```bash
cd ON-VMS-2.0
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
streamlit run Home.py
```

Open the URL shown in the terminal (usually `http://localhost:8501`).

**LAN:** `.streamlit/config.toml` binds `0.0.0.0:8501`, so other devices on the same network can open `http://<this-computer-LAN-IP>:8501`. If Windows blocks it, add an inbound firewall rule for TCP port **8501**.

## Default logins (first run)

Created automatically if the database is empty — see `core/auth.py` (`DEFAULT_USERS`). **Change passwords in production.**

## Moving to a new computer (e.g. Mac)

1. Copy the whole **`ON-VMS-2.0`** folder.
2. Copy **`on_vms.db`** if it lives next to `Home.py` (default).
3. Copy **`uploads/`** if you use technician photos/videos (ignored by git when using default `.gitignore`).
4. Do **not** copy `.venv` / `.venv311` — recreate the venv on the new machine and run `pip install -r requirements.txt` again.
5. Run `streamlit run Home.py` from inside `ON-VMS-2.0`.

## Version tag (Git)

If this repo is initialized with Git, release **1.0.0** is tagged as `v1.0.0`:

```bash
git tag -l
```

## Optional scripts (not required for daily ERP)

- `populate_vms_techs.py`, `merge_assets_images.py`, `scrape_51butterfly.py`, `cluster_faces.py` — separate dependencies may apply (e.g. `requests`, `beautifulsoup4`, ML stacks). The core app uses only `requirements.txt`.
