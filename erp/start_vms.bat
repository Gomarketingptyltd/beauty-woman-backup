@echo off
setlocal
cd /d "C:\Users\bjhyn\Desktop\Ocean_Noir_VMS\ON-VMS-2.0"

REM 若已在跑则退出
for /f %%p in ('powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 8501 -State Listen -ErrorAction SilentlyContinue).Count"') do set "LISTEN=%%p"
if not "%LISTEN%"=="0" if not "%LISTEN%"=="" exit /b 0

start "" /min "C:\Users\bjhyn\Desktop\Ocean_Noir_VMS\ON-VMS-2.0\_run_streamlit.cmd"
exit /b 0
