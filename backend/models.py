from sqlalchemy import Column, String, DateTime, Text, Float, Integer, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class RecordingStatus(enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused" 
    ENDED = "ended"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    google_id = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    recordings = relationship("Recording", back_populates="user")

class Recording(Base):
    __tablename__ = "recordings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(RecordingStatus), default=RecordingStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    audio_file_path = Column(String(500))
    transcription_text = Column(Text)
    llm_provider = Column(String(100), default="requestyai")
    
    user = relationship("User", back_populates="recordings")
    chunks = relationship("RecordingChunk", back_populates="recording")

class RecordingChunk(Base):
    __tablename__ = "recording_chunks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    recording_id = Column(String(36), ForeignKey("recordings.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    audio_blob_path = Column(String(500), nullable=False)
    duration_seconds = Column(Float)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    recording = relationship("Recording", back_populates="chunks")
