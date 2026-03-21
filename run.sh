#!/usr/bin/env bash
# Quick starter for Unix/macOS
# - Creates .venv if missing
# - Activates the venv
# - Installs backend requirements
# - Starts uvicorn server and opens browser
set -e
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ ! -d "$ROOT_DIR/.venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv "$ROOT_DIR/.venv"
fi

source "$ROOT_DIR/.venv/bin/activate"

echo "Installing requirements..."
pip install -r "$ROOT_DIR/backend/requirements.txt"

# Start uvicorn in background and open browser
cd "$ROOT_DIR/backend"
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
UVICORN_PID=$!
sleep 1
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://127.0.0.1:8000/" || true
elif command -v open >/dev/null 2>&1; then
  open "http://127.0.0.1:8000/" || true
else
  echo "Open your browser at http://127.0.0.1:8000/"
fi
wait $UVICORN_PID
