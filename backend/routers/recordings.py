from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from auth import get_current_user
from models import User, Recording, RecordingStatus
from repositories.mysql_repositories import MySQLRecordingRepository, MySQLRecordingChunkRepository
from database import get_db
import os
import shutil
from datetime import datetime

router = APIRouter(prefix="/recordings", tags=["recordings"])

# Audio storage directory
AUDIO_STORAGE_PATH = os.getenv("AUDIO_STORAGE_PATH", "audio_files")
os.makedirs(AUDIO_STORAGE_PATH, exist_ok=True)

class RecordingResponse(BaseModel):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    audio_file_path: Optional[str]
    transcription_text: Optional[str]

class CreateRecordingResponse(BaseModel):
    id: str
    status: str
    created_at: datetime

@router.get("/", response_model=List[RecordingResponse])
async def list_recordings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's recordings"""
    recording_repo = MySQLRecordingRepository(db)
    recordings = recording_repo.list_recordings(current_user.id)
    
    return [
        RecordingResponse(
            id=recording.id,
            status=recording.status.value,
            created_at=recording.created_at,
            updated_at=recording.updated_at,
            audio_file_path=recording.audio_file_path,
            transcription_text=recording.transcription_text
        )
        for recording in recordings
    ]

@router.post("/", response_model=CreateRecordingResponse)
async def create_recording(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new recording session"""
    recording_repo = MySQLRecordingRepository(db)
    recording = recording_repo.create_recording(current_user.id)
    
    # Create directory for this recording's chunks
    recording_dir = os.path.join(AUDIO_STORAGE_PATH, recording.id)
    os.makedirs(recording_dir, exist_ok=True)
    
    return CreateRecordingResponse(
        id=recording.id,
        status=recording.status.value,
        created_at=recording.created_at
    )

@router.post("/{recording_id}/chunks")
async def upload_chunk(
    recording_id: str,
    chunk_index: int = Form(...),
    audio_chunk: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload an audio chunk"""
    recording_repo = MySQLRecordingRepository(db)
    chunk_repo = MySQLRecordingChunkRepository(db)
    
    # Verify recording exists and belongs to user
    recording = recording_repo.get_recording(recording_id)
    if not recording or recording.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found"
        )
    
    # Save chunk file
    chunk_filename = f"chunk_{chunk_index:04d}.webm"
    chunk_path = os.path.join(AUDIO_STORAGE_PATH, recording_id, chunk_filename)
    
    with open(chunk_path, "wb") as buffer:
        shutil.copyfileobj(audio_chunk.file, buffer)
    
    # Save chunk metadata
    chunk_repo.add_chunk(
        recording_id=recording_id,
        chunk_index=chunk_index,
        audio_blob_path=chunk_path,
        duration_seconds=None  # Could be extracted from audio file if needed
    )
    
    return {"message": "Chunk uploaded successfully", "chunk_index": chunk_index}

@router.patch("/{recording_id}/pause")
async def pause_recording(
    recording_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark recording as paused"""
    recording_repo = MySQLRecordingRepository(db)
    
    # Verify recording exists and belongs to user
    recording = recording_repo.get_recording(recording_id)
    if not recording or recording.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found"
        )
    
    recording_repo.update_recording_status(recording_id, "paused")
    return {"message": "Recording paused"}

@router.post("/{recording_id}/finish")
async def finish_recording(
    recording_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark recording as ended and trigger transcription"""
    recording_repo = MySQLRecordingRepository(db)
    chunk_repo = MySQLRecordingChunkRepository(db)
    
    # Verify recording exists and belongs to user
    recording = recording_repo.get_recording(recording_id)
    if not recording or recording.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found"
        )
    
    # Get all chunks for this recording
    chunks = chunk_repo.get_chunks_by_recording(recording_id)
    
    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio chunks found for this recording"
        )
    
    # Assemble chunks into single audio file
    final_audio_path = os.path.join(AUDIO_STORAGE_PATH, f"{recording_id}.webm")
    
    # Simple concatenation - in production would use ffmpeg for proper merging
    with open(final_audio_path, "wb") as outfile:
        for chunk in sorted(chunks, key=lambda x: x.chunk_index):
            with open(chunk.audio_blob_path, "rb") as infile:
                outfile.write(infile.read())
    
    # Trigger transcription with LLM provider
    try:
        from llm.requestyai_provider import MockLLMProvider
        # Use MockLLMProvider for development, RequestYaiProvider for production
        llm_provider = MockLLMProvider()
        transcription_text = llm_provider.transcribe_audio(final_audio_path)
    except Exception as e:
        print(f"Transcription failed: {e}")
        transcription_text = "Transcription failed. Please try again."
    
    # Update recording with final file and transcription
    recording_repo.update_recording_transcription(
        recording_id, final_audio_path, transcription_text
    )
    
    return {"message": "Recording finished", "transcription": transcription_text}

@router.get("/{recording_id}", response_model=RecordingResponse)
async def get_recording(
    recording_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get single recording details"""
    recording_repo = MySQLRecordingRepository(db)
    
    recording = recording_repo.get_recording(recording_id)
    if not recording or recording.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found"
        )
    
    return RecordingResponse(
        id=recording.id,
        status=recording.status.value,
        created_at=recording.created_at,
        updated_at=recording.updated_at,
        audio_file_path=recording.audio_file_path,
        transcription_text=recording.transcription_text
    )
