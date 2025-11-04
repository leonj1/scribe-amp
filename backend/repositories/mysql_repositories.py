from typing import List, Optional
from sqlalchemy.orm import Session
from models import User, Recording, RecordingChunk, RecordingStatus
from repositories.interfaces import UserRepository, RecordingRepository, RecordingChunkRepository

class MySQLUserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, google_id: str, email: str, display_name: str, avatar_url: str) -> User:
        user = User(
            google_id=google_id,
            email=email, 
            display_name=display_name,
            avatar_url=avatar_url
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user_by_google_id(self, google_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.google_id == google_id).first()

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

class MySQLRecordingRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_recording(self, user_id: str) -> Recording:
        recording = Recording(user_id=user_id, status=RecordingStatus.ACTIVE)
        self.db.add(recording)
        self.db.commit()
        self.db.refresh(recording)
        return recording

    def get_recording(self, recording_id: str) -> Optional[Recording]:
        return self.db.query(Recording).filter(Recording.id == recording_id).first()

    def list_recordings(self, user_id: str) -> List[Recording]:
        return self.db.query(Recording).filter(Recording.user_id == user_id).order_by(Recording.created_at.desc()).all()

    def update_recording_status(self, recording_id: str, status: str) -> None:
        recording = self.db.query(Recording).filter(Recording.id == recording_id).first()
        if recording:
            recording.status = RecordingStatus(status)
            self.db.commit()

    def update_recording_transcription(self, recording_id: str, audio_file_path: str, transcription_text: str) -> None:
        recording = self.db.query(Recording).filter(Recording.id == recording_id).first()
        if recording:
            recording.audio_file_path = audio_file_path
            recording.transcription_text = transcription_text
            recording.status = RecordingStatus.ENDED
            self.db.commit()

class MySQLRecordingChunkRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_chunk(self, recording_id: str, chunk_index: int, audio_blob_path: str, duration_seconds: Optional[float]) -> RecordingChunk:
        chunk = RecordingChunk(
            recording_id=recording_id,
            chunk_index=chunk_index,
            audio_blob_path=audio_blob_path,
            duration_seconds=duration_seconds
        )
        self.db.add(chunk)
        self.db.commit()
        self.db.refresh(chunk)
        return chunk

    def get_chunks_by_recording(self, recording_id: str) -> List[RecordingChunk]:
        return self.db.query(RecordingChunk).filter(
            RecordingChunk.recording_id == recording_id
        ).order_by(RecordingChunk.chunk_index).all()
