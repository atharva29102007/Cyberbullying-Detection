# AI-Powered Cyberbullying Prevention System

This repository contains a prototype web application: a FastAPI backend and a minimal static frontend. It demonstrates the requested flows:
- "I want to talk" — Paste messages to analyze by an AI engine. Includes a roleplay simulator.
- "I want to report" — Submit incident reports with optional screenshots for admin review.

Folders:
- `backend/` — FastAPI app, AI engine, database models.
- `frontend/` — Static website (HTML/CSS/JS) for the UI.

Quick start (one command)

We've added small start scripts at the repository root to make it easy for another user to run the project with a single command.

Windows (PowerShell):

1. Open PowerShell in the repo root and run:

```powershell
.\run.ps1
```

Windows (cmd.exe):

1. Double-click or run from cmd:

```bat
run.bat
```

macOS / Linux:

1. Make the script executable (one-time) and run it:

```bash
chmod +x run.sh; ./run.sh
```

What the scripts do:
- Create a local virtual environment in `.venv` if missing
- Install the Python packages listed in `backend/requirements.txt`
- Start the FastAPI server (uvicorn) with the correct package import path
- Open your default browser to `http://127.0.0.1:8000/` where the frontend is served

If you prefer manual steps, here's the equivalent (PowerShell):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
Set-Location -Path .\backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Notes & Next steps:
- The AI engine is a lightweight, local prototype. Replace `ai_engine.analyze_text` with a BERT-based classifier (Hugging Face) for production.
- Secure the admin endpoints (authentication) before deploying.
- Use a production database and storage for reports if needed.

Environment variables are used for API keys; do not commit your keys to source control.
