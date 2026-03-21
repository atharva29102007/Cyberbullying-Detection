from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Report(Base):
    __tablename__ = 'reports'
    id = Column(Integer, primary_key=True, index=True)
    reporter_name = Column(String(128), nullable=True)
    details = Column(Text, nullable=False)
    screenshot_path = Column(String(512), nullable=True)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def as_dict(self):
        return {
            'id': self.id,
            'reporter_name': self.reporter_name,
            'details': self.details,
            'screenshot_path': self.screenshot_path,
            'resolved': bool(self.resolved),
            'created_at': self.created_at.isoformat(),
        }

class Journal(Base):
    __tablename__ = 'journals'
    id = Column(Integer, primary_key=True, index=True)
    entry = Column(Text, nullable=False)
    mood = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def as_dict(self):
        return {
            'id': self.id,
            'entry': self.entry,
            'mood': self.mood,
            'created_at': self.created_at.isoformat() if self.created_at is not None else None,
        }

class KindnessScore(Base):
    __tablename__ = 'kindness_scores'
    id = Column(Integer, primary_key=True, index=True)
    user_identifier = Column(String(128), nullable=True)
    score = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
