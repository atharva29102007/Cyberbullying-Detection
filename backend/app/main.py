from fastapi import FastAPI, File, UploadFile, Form, Request, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from . import ai_engine, database, models, schemas
from .database import SessionLocal, engine
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-Powered Cyberbullying Prevention System")

# Admin token for protecting admin endpoints
ADMIN_TOKEN = os.getenv('ADMIN_TOKEN', 'changeme')


def get_admin(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail='Missing Authorization header')
    if not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Invalid auth scheme')
    token = authorization.split(' ', 1)[1]
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail='Forbidden')
    return True

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post('/api/analyze')
async def analyze(payload: schemas.TextIn):
    text = payload.text
    result = ai_engine.analyze_text(text)
    return JSONResponse(result)


@app.post('/api/chat')
async def chat(payload: schemas.ChatIn):
    # payload.messages is a list of ChatMessage models
    messages = [m.dict() for m in payload.messages]
    resp = ai_engine.chat_response(messages)
    return JSONResponse(resp)

@app.post('/api/roleplay')
async def roleplay(payload: schemas.RoleplayIn):
    # simulate roleplay response from the AI support engine
    sim = ai_engine.simulate_roleplay(payload.scenario, payload.user_response)
    return JSONResponse(sim)

@app.post('/api/report')
async def report(name: str = Form(None), details: str = Form(...), file: UploadFile = File(None)):
    saved_path = None
    if file:
        saved_path = database.save_upload(file)
    db = SessionLocal()
    report = models.Report(reporter_name=name, details=details, screenshot_path=saved_path)
    db.add(report)
    db.commit()
    db.refresh(report)
    db.close()
    return {"status":"ok","id":report.id}

@app.get('/api/admin/reports')
async def get_reports(admin: bool = Depends(get_admin)):
    db = SessionLocal()
    reports = db.query(models.Report).order_by(models.Report.created_at.desc()).all()
    out = [r.as_dict() for r in reports]
    db.close()
    return out


@app.post('/api/admin/reports/{report_id}/resolve')
async def resolve_report(report_id: int, admin: bool = Depends(get_admin)):
    db = SessionLocal()
    rpt = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not rpt:
        db.close()
        raise HTTPException(status_code=404, detail='Report not found')
    rpt.resolved = True
    db.add(rpt)
    db.commit()
    out = rpt.as_dict()
    db.close()
    return out


@app.delete('/api/admin/reports/{report_id}')
async def delete_report(report_id: int, admin: bool = Depends(get_admin)):
    """Delete a report (admin only). Also removes uploaded screenshot file when present."""
    db = SessionLocal()
    rpt = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not rpt:
        db.close()
        raise HTTPException(status_code=404, detail='Report not found')
    screenshot = rpt.screenshot_path
    db.delete(rpt)
    db.commit()
    db.close()
    # attempt to remove screenshot file if it exists
    if screenshot:
        try:
            if os.path.exists(screenshot):
                os.remove(screenshot)
        except Exception:
            # ignore filesystem errors
            pass
    return {"status":"ok","id": report_id}

@app.post('/api/mood')
async def add_mood(payload: schemas.MoodIn):
    db = SessionLocal()
    j = models.Journal(entry=payload.entry, mood=payload.mood)
    db.add(j)
    db.commit()
    db.refresh(j)
    db.close()
    # Return created_at so the frontend can display when the mood was saved
    return {"status":"ok","id": j.id, "created_at": j.created_at.isoformat()}


@app.get('/api/mood')
async def list_moods():
    db = SessionLocal()
    entries = db.query(models.Journal).order_by(models.Journal.created_at.desc()).all()
    out = [e.as_dict() for e in entries]
    db.close()
    return out


@app.delete('/api/mood/{mood_id}')
async def delete_mood(mood_id: int):
    db = SessionLocal()
    entry = db.query(models.Journal).filter(models.Journal.id == mood_id).first()
    if not entry:
        db.close()
        raise HTTPException(status_code=404, detail='Mood entry not found')
    db.delete(entry)
    db.commit()
    db.close()
    return {"status":"ok","id": mood_id}


@app.delete('/api/mood')
async def delete_all_moods():
    """Delete all mood entries. Intended for UI 'Clear all' action."""
    db = SessionLocal()
    try:
        num = db.query(models.Journal).delete()
        db.commit()
    finally:
        db.close()
    return {"status":"ok","deleted": num}

@app.get('/api/helpline')
async def helpline():
    # Provide helpline and cybercrime link
    return {
        "national_helpline":"National Mental Health Helpline: 08046110007",
        "cybercrime_link":"https://www.cybercrime.gov.in/"
    }


# Serve the frontend files (index.html, static assets) from the repository's frontend/ directory.
# Mounting the static files AFTER the API route definitions prevents the static app from
# intercepting requests to /api/* which would result in 404/405 errors.
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
frontend_dir = os.path.join(root_dir, 'frontend')
if os.path.isdir(frontend_dir):
    app.mount('/', StaticFiles(directory=frontend_dir, html=True), name='frontend')
