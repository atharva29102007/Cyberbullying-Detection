from pydantic import BaseModel
from typing import Optional

class TextIn(BaseModel):
    text: str

class RoleplayIn(BaseModel):
    scenario: Optional[str] = None
    user_response: str

class MoodIn(BaseModel):
    entry: str
    mood: Optional[str] = None

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatIn(BaseModel):
    messages: list[ChatMessage]
