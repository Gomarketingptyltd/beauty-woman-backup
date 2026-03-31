@echo off
REM 供桌面脚本调用：用 py -m streamlit，避免「找不到 streamlit 命令」
setlocal
cd /d "%~dp0"

set "LOG=%USERPROFILE%\Desktop\VMS_last_start.log"
echo [%date% %time%] starting... > "%LOG%"

REM 优先：Python Launcher（双击 bat 时 PATH 往往不含 Scripts）
if exist "%LOCALAPPDATA%\Programs\Python\Launcher\py.exe" (
  "%LOCALAPPDATA%\Programs\Python\Launcher\py.exe" -m streamlit run Home.py --server.headless true >> "%LOG%" 2>&1
  exit /b %ERRORLEVEL%
)

REM 其次：本机已安装的 python.exe（按常见路径）
if exist "%LOCALAPPDATA%\Programs\Python\Python314\python.exe" (
  "%LOCALAPPDATA%\Programs\Python\Python314\python.exe" -m streamlit run Home.py --server.headless true >> "%LOG%" 2>&1
  exit /b %ERRORLEVEL%
)

REM 最后：PATH 里的 py / python
where py >nul 2>&1 && ( py -m streamlit run Home.py --server.headless true >> "%LOG%" 2>&1 & exit /b %ERRORLEVEL% )
where python >nul 2>&1 && ( python -m streamlit run Home.py --server.headless true >> "%LOG%" 2>&1 & exit /b %ERRORLEVEL% )

echo ERROR: 找不到 py/python，无法启动 Streamlit。>> "%LOG%"
exit /b 1
