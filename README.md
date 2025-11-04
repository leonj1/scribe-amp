# Audio Transcription Service

A secure healthcare platform for recording and transcribing patient notes with Google authentication, chunked audio streaming, and LLM-powered transcription.

## Features

- **Google OAuth2 Authentication** - Secure login with Google accounts
- **Chunked Audio Recording** - Stream audio in real-time for long recordings
- **Auto Transcription** - LLM-powered transcription via RequestYAI provider
- **Dashboard Interface** - Manage and review previous recordings
- **HIPAA-Ready Architecture** - Built with healthcare compliance in mind

## Architecture

- **Frontend**: React with Ant Design UI
- **Backend**: FastAPI with JWT authentication
- **Database**: MySQL with SQLAlchemy ORM
- **Storage**: Local/cloud audio file storage
- **Transcription**: Abstracted LLM provider interface

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- MySQL 8.0+
- Google OAuth2 credentials
- RequestYAI API key (optional, mock provider available)

### Development Setup

1. **Clone and setup**
   ```bash
   git clone <repository>
   cd audio-transcription-service
   ```

2. **Backend setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp ../.env.example .env
   # Edit .env with your configuration
   python main.py
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

### Docker Setup

1. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Start services**
   ```bash
   docker-compose up -d
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- MySQL: localhost:3306

## Configuration

### Required Environment Variables

**Backend (.env)**
- `GOOGLE_CLIENT_ID` - Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth2 client secret
- `JWT_SECRET` - Secret for JWT token signing
- `MYSQL_URL` - Database connection string
- `LLM_API_KEY` - RequestYAI API key (optional)
- `AUDIO_STORAGE_PATH` - Audio file storage directory

**Frontend (.env)**
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth2 client ID

### Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth2 credentials
5. Add authorized origins:
   - `http://localhost:3000` (development)
   - Your production domain
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`

## API Endpoints

### Authentication
- `POST /auth/google/token` - Exchange Google token for JWT
- `GET /auth/google/login` - Get Google OAuth URL

### Recordings
- `GET /recordings` - List user recordings
- `POST /recordings` - Create new recording session
- `POST /recordings/{id}/chunks` - Upload audio chunk
- `PATCH /recordings/{id}/pause` - Pause recording
- `POST /recordings/{id}/finish` - End recording and trigger transcription
- `GET /recordings/{id}` - Get recording details

## Database Schema

### Users
- `id` (UUID) - Primary key
- `google_id` - Google account identifier
- `email` - User email
- `display_name` - User display name
- `avatar_url` - Profile picture URL
- `created_at`, `updated_at` - Timestamps

### Recordings
- `id` (UUID) - Primary key
- `user_id` - Foreign key to users
- `status` - Enum: active, paused, ended
- `audio_file_path` - Path to assembled audio file
- `transcription_text` - LLM transcription result
- `llm_provider` - Provider used for transcription
- `created_at`, `updated_at` - Timestamps

### Recording Chunks
- `id` (UUID) - Primary key
- `recording_id` - Foreign key to recordings
- `chunk_index` - Sequential order
- `audio_blob_path` - Path to chunk file
- `duration_seconds` - Chunk duration
- `uploaded_at` - Upload timestamp

## Development

### Backend Structure
```
backend/
├── main.py              # FastAPI application
├── models.py            # SQLAlchemy models
├── database.py          # Database configuration
├── auth.py              # Authentication utilities
├── routers/             # API route handlers
│   ├── auth.py
│   └── recordings.py
├── repositories/        # Data access layer
│   ├── interfaces.py
│   └── mysql_repositories.py
└── llm/                 # LLM provider abstraction
    ├── interface.py
    └── requestyai_provider.py
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── RecordingInterface.js
│   │   └── RecordingsList.js
│   ├── pages/           # Page components
│   │   ├── LandingPage.js
│   │   ├── Dashboard.js
│   │   └── AuthCallback.js
│   ├── hooks/           # Custom React hooks
│   │   └── useAuth.js
│   └── services/        # API services
│       └── api.js
└── public/
```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Production Environment Variables
- Set secure JWT_SECRET
- Use production Google OAuth credentials
- Configure production database
- Set up cloud storage for audio files
- Enable HTTPS/TLS

### Security Considerations
- All API endpoints require authentication (except auth endpoints)
- Audio data encrypted at rest
- JWT tokens with expiration
- CORS configured for production domains
- Input validation on all endpoints

## LLM Provider Integration

The system uses an abstracted provider interface for transcription. To add new providers:

1. Implement the `LLMProvider` protocol in `backend/llm/`
2. Update the provider factory/configuration
3. Add provider-specific environment variables

### Mock Provider
For development, a mock provider is available that returns sample transcription text.

## License

[Your License Here]
