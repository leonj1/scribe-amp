# Railway Deployment Guide

## Quick Deploy

To deploy this project to Railway using the provided token:

```bash
# Set the Railway token
export RAILWAY_TOKEN=20727ba7-8cd3-4a1b-a566-c2014ce081da

# Login to Railway (required for initial setup)
railway login

# Link to existing project or create new one
railway init

# Deploy the application
railway up
```

## Manual Steps

1. **Login to Railway**:
   ```bash
   railway login
   ```

2. **Create a new project** (or link existing):
   ```bash
   railway init
   ```

3. **Set environment variables** in Railway dashboard:
   - `GOOGLE_CLIENT_ID` - Your Google OAuth2 client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google OAuth2 client secret
   - `JWT_SECRET` - A secure random string for JWT signing
   - `LLM_API_KEY` - Your LLM provider API key (optional)

4. **Deploy the application**:
   ```bash
   railway up
   ```

## Alternative: Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select `leonj1/scribe-amp`
5. Railway will automatically detect the configuration files:
   - `railway.toml` - Main configuration
   - `backend/railway.json` - Backend service config
   - `frontend/railway.json` - Frontend service config

## Services Deployed

The project will deploy 3 services:

1. **MySQL Database** - Persistent data storage
2. **Backend API** - FastAPI application (Python)
3. **Frontend** - React application (Node.js)

## Environment Variables Required

Set these in the Railway dashboard after deployment:

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `LLM_API_KEY` | RequestYAI API key | No (uses mock provider) |

## Post-Deployment

1. Note the deployed URLs for each service
2. Update Google OAuth2 settings with new domains
3. Test the authentication flow
4. Verify audio recording and transcription features

## Troubleshooting

- **Auth issues**: Check Google OAuth2 redirect URLs
- **Database connection**: Verify MySQL service is running
- **API errors**: Check backend logs in Railway dashboard
- **Frontend issues**: Ensure REACT_APP_API_URL points to backend service
