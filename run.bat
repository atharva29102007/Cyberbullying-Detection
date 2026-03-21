@echo off
REM Quick starter for Windows (batch)
REM - Creates .venv if missing
REM - Activates the venv
REM - Installs backend requirements
REM - Opens browser to the app
REM - Starts uvicorn server (foreground)

IF NOT EXIST "%~dp0.venv" (
    echo Creating virtual environment...
    python -m venv "%~dp0.venv"
)

call "%~dp0.venv\Scripts\activate.bat"

echo Installing requirements...
pip install -r "%~dp0backend\requirements.txt"

start "" "http://127.0.0.1:8000/"

echo Starting server...
cd /d "%~dp0backend"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
