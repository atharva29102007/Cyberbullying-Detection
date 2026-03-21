# Quick starter for Windows PowerShell
# - Creates .venv if missing
# - Activates the venv
# - Installs backend requirements
# - Opens browser to the app
# - Starts uvicorn server (foreground)

$ErrorActionPreference = 'Stop'
$venv = Join-Path $PSScriptRoot ".venv"
if (-not (Test-Path $venv)) {
    Write-Host "Creating virtual environment..."
    python -m venv $venv
}

Write-Host "Activating virtual environment..."
. "$venv\Scripts\Activate.ps1"

Write-Host "Installing requirements..."
pip install -r "$PSScriptRoot\backend\requirements.txt"

# Open browser (allow a short delay so uvicorn can start)
Start-Process "http://127.0.0.1:8000/"
Start-Sleep -Seconds 1

Write-Host "Starting server (uvicorn app.main:app)"
# Change to backend directory so uvicorn can import app package
Set-Location -Path "$PSScriptRoot\backend"
# Run uvicorn in foreground so logs show in this terminal
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
