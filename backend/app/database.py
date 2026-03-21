import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from fastapi import UploadFile

load_dotenv()
# Read DATABASE_URL from env and fall back to a safe default. Strip whitespace to avoid parsing errors.
DB_URL = os.getenv('DATABASE_URL')
if not DB_URL or not DB_URL.strip():
    DB_URL = 'sqlite:///./data.db'
else:
    DB_URL = DB_URL.strip()

import sys
print("[debug] DB_URL repr:", repr(DB_URL), file=sys.stderr)
# Normalize a few common alternative forms (e.g. 'file:../dev.db') into a SQLAlchemy sqlite URL
if DB_URL.startswith('file:'):
    raw_path = DB_URL[len('file:'):]
    # resolve relative paths to absolute paths and convert to unix-style separators
    abs_path = os.path.abspath(raw_path)
    abs_path_unix = abs_path.replace('\\', '/')
    DB_URL = f"sqlite:///{abs_path_unix}"

# Create the engine for the (possibly normalized) DB_URL
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


def save_upload(file: UploadFile) -> str:
    filename = file.filename
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, 'wb') as f:
        f.write(file.file.read())
    return path


# --- Lightweight migration: ensure 'resolved' column exists on reports ---
def _ensure_reports_resolved_column():
    try:
        with engine.connect() as conn:
            # Check for reports table
            res = conn.execute(text("PRAGMA table_info('reports');"))
            cols = [row[1] for row in res.fetchall()]
            if 'resolved' not in cols:
                # Add the resolved column with default 0 (False)
                conn.execute(text("ALTER TABLE reports ADD COLUMN resolved BOOLEAN DEFAULT 0;"))
                print('[database] added missing column: resolved', file=sys.stderr)
    except Exception as e:
        print('[database] failed to ensure resolved column:', e, file=sys.stderr)

# Run migration at import time (safe for small prototypes)
_ensure_reports_resolved_column()
