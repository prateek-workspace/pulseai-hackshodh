# Pulse AI - Setup Guide

## Complete Setup Instructions for Google Drive Health Data Ingestion

This guide covers how to set up and configure the Google OAuth integration for batch health data ingestion from Google Drive.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [OAuth Flow Overview](#oauth-flow-overview)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Testing the Integration](#testing-the-integration)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Python 3.10+** installed
- **PostgreSQL database** (Neon recommended for serverless)
- **Google account** for OAuth configuration
- **Node.js 18+** (for frontend)

---

## Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Pulse AI` (or your preferred name)
4. Click **Create**

### Step 2: Enable Required APIs

1. In your project, go to **APIs & Services** → **Library**
2. Search for and enable:
   - **Google Drive API**
   - **Google+ API** (for user info)

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (or Internal for organization)
3. Fill in the required fields:
   - **App name**: `Pulse AI`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **Save and Continue**

#### Add Scopes

1. Click **Add or Remove Scopes**
2. Add these scopes:
   ```
   https://www.googleapis.com/auth/drive.readonly
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   ```
3. Click **Update** and **Save and Continue**

#### Add Test Users (Development Mode)

1. Click **Add Users**
2. Add email addresses of users who will test the app
3. Click **Save and Continue**

> ⚠️ **Note**: In development mode, only added test users can use OAuth. For production, submit for verification.

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: `Pulse AI Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://localhost:8000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:8000/oauth/google/callback
     ```
5. Click **Create**

### Step 5: Save Credentials

After creation, you'll see:
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxx`

> 🔐 **Important**: Save these securely! You'll need them for environment configuration.

---

## Environment Configuration

### Step 1: Copy Example Environment File

```bash
cd backend
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit the `.env` file with your values:

```env
# Neon PostgreSQL Database URL
DATABASE_URL=postgresql://username:password@your-neon-host.neon.tech/dbname?sslmode=require

# Gemini API endpoint (for AI analysis)
GEMINI_API_URL=https://your-gemini-api.com

# Server settings
HOST=0.0.0.0
PORT=8000

# Google OAuth Configuration (REQUIRED for Drive ingestion)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/oauth/google/callback

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `GEMINI_API_URL` | Gemini API endpoint for AI | ❌ Optional |
| `HOST` | Server host | ✅ Yes |
| `PORT` | Server port | ✅ Yes |
| `GOOGLE_CLIENT_ID` | OAuth Client ID from Google | ✅ Yes (for Drive) |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret from Google | ✅ Yes (for Drive) |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | ✅ Yes (for Drive) |
| `FRONTEND_URL` | Frontend app URL | ✅ Yes (for Drive) |

---

## Database Setup

### Using Neon (Recommended)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### Local PostgreSQL

```bash
# Create database
createdb pulseai

# Update DATABASE_URL
DATABASE_URL=postgresql://localhost/pulseai
```

### Initialize Database Schema

The schema is auto-created on first run. Tables created:
- `users` - User accounts
- `health_data` - Health metrics
- `care_scores` - Computed health scores
- `escalations` - Alert escalations
- `api_keys` - API authentication keys
- `device_registrations` - Registered devices
- `google_oauth_tokens` - OAuth tokens (new)
- `processed_drive_files` - Ingestion tracking (new)
- `ingestion_jobs` - Sync job history (new)

---

## Running the Application

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Verify Installation

1. Open [http://localhost:8000/docs](http://localhost:8000/docs) for API docs
2. Open [http://localhost:3000](http://localhost:3000) for frontend

---

## OAuth Flow Overview

### How the Google Drive Ingestion Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User clicks   │────▶│  Google OAuth    │────▶│  Callback with  │
│  "Connect Drive"│     │  Consent Screen  │     │  access tokens  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Health data    │◀────│ Extract SQLite   │◀────│  Download ZIP   │
│  saved to DB    │     │  from ZIP        │     │  from Drive     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Flow Steps

1. **User initiates OAuth**: Frontend redirects to `/oauth/google/authorize`
2. **Google consent**: User grants Drive read access
3. **Callback**: Backend receives authorization code at `/oauth/google/callback`
4. **Token exchange**: Code exchanged for access/refresh tokens
5. **User creation**: User created/linked from Google profile
6. **Sync available**: User can now trigger Drive sync

---

## API Endpoints Reference

### OAuth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/oauth/google/authorize` | Start OAuth flow (redirects to Google) |
| `GET` | `/oauth/google/authorize-url` | Get OAuth URL (for SPA) |
| `GET` | `/oauth/google/callback` | OAuth callback handler |
| `GET` | `/oauth/google/status/{user_id}` | Check OAuth status |
| `DELETE` | `/oauth/google/revoke/{user_id}` | Revoke OAuth access |

### Drive Ingestion Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/oauth/drive/files/{user_id}` | List Drive files |
| `GET` | `/oauth/drive/health-exports/{user_id}` | Find health exports |
| `POST` | `/oauth/drive/sync` | Trigger full Drive sync |
| `POST` | `/oauth/drive/process-file` | Process specific file |
| `GET` | `/oauth/drive/ingestion-jobs/{user_id}` | List sync jobs |
| `GET` | `/oauth/drive/processed-files/{user_id}` | List processed files |

### Example: Trigger Drive Sync

```bash
curl -X POST http://localhost:8000/oauth/drive/sync \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'
```

**Response:**
```json
{
  "job_id": 1,
  "status": "completed",
  "files_found": 1,
  "files_processed": 1,
  "records_imported": 2847,
  "details": [
    {
      "status": "completed",
      "file_id": "1abc...",
      "file_name": "Health Connect.zip",
      "tables_found": ["heart_rate", "sleep_session", "steps"],
      "records_parsed": 2847,
      "records_saved": 2847
    }
  ]
}
```

---

## Testing the Integration

### Step 1: Export Health Data from Google Fit

1. Open Google Fit app on your Android device
2. Go to **Settings** → **Manage your data** → **Export data**
3. Choose **Export to Google Drive**
4. Wait for export to complete

### Step 2: Connect Google Drive

1. Open the frontend at `http://localhost:3000`
2. Click **"Connect Google Drive"**
3. Grant Drive read access
4. You'll be redirected back with a success message

### Step 3: Trigger Sync

```bash
# Via API
curl -X POST http://localhost:8000/oauth/drive/sync \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'
```

Or use the dashboard UI to click "Sync Health Data"

### Step 4: Verify Import

```bash
# Check imported records
curl http://localhost:8000/dashboard/recent-data/1
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid client" OAuth Error

**Cause**: Client ID/Secret mismatch or not properly configured.

**Fix**:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Check that redirect URI matches exactly in Google Console

#### 2. "Access blocked: This app's request is invalid"

**Cause**: Redirect URI not authorized.

**Fix**:
- Add `http://localhost:8000/oauth/google/callback` to Authorized redirect URIs in Google Console

#### 3. "No SQLite database found in ZIP"

**Cause**: ZIP file doesn't contain expected Health Connect export format.

**Fix**:
- Ensure you're exporting from Google Fit/Health Connect
- The ZIP should contain a `.db` file

#### 4. OAuth Token Expired

**Cause**: Access token expired and refresh failed.

**Fix**:
- Tokens auto-refresh if refresh_token is present
- If issues persist, have user re-authorize via `/oauth/google/authorize`

#### 5. Database Connection Error

**Cause**: Invalid DATABASE_URL or network issues.

**Fix**:
- Verify DATABASE_URL format: `postgresql://user:pass@host/db`
- For Neon, ensure `?sslmode=require` is included

### Debug Mode

Enable debug logging:

```python
# In main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Getting Help

1. Check API docs at `/docs`
2. Review server logs for detailed errors
3. Test OAuth flow manually using the `/oauth/google/authorize-url` endpoint

---

## Production Deployment

### Additional Steps for Production

1. **Submit OAuth app for verification** in Google Console
2. **Use HTTPS** for all redirect URIs
3. **Secure secrets** using environment variables or secret manager
4. **Update redirect URIs** in Google Console for production domain

### Production Environment Variables

```env
# Production URLs
GOOGLE_REDIRECT_URI=https://api.yourapp.com/oauth/google/callback
FRONTEND_URL=https://yourapp.com
```

### Security Recommendations

- Store tokens encrypted at rest
- Use short-lived access tokens with refresh
- Implement rate limiting on OAuth endpoints
- Monitor for suspicious OAuth activity

---

## Architecture Summary

```
┌────────────────────────────────────────────────────────────────┐
│                        Pulse AI Backend                         │
├────────────────────────────────────────────────────────────────┤
│  Routes                                                         │
│  ├── /oauth/* ─────────────── Google OAuth & Drive Ingestion   │
│  ├── /auth/* ──────────────── API Key Management                │
│  ├── /webhook/* ───────────── Health Connect Webhook            │
│  ├── /dashboard/* ─────────── Dashboard Data                    │
│  └── /analysis/* ──────────── AI Analysis                       │
├────────────────────────────────────────────────────────────────┤
│  Services                                                       │
│  ├── GoogleOAuthService ───── OAuth token management            │
│  ├── DriveIngestionService ── ZIP/SQLite processing             │
│  ├── CareScoreEngine ──────── Health score computation          │
│  └── AnomalyDetector ──────── Drift detection                   │
├────────────────────────────────────────────────────────────────┤
│  Models                                                         │
│  ├── GoogleOAuthToken ─────── OAuth credentials                 │
│  ├── ProcessedDriveFile ───── Idempotency tracking              │
│  ├── IngestionJob ─────────── Sync job history                  │
│  ├── HealthData ───────────── Normalized health records         │
│  └── CareScore ────────────── Computed health scores            │
└────────────────────────────────────────────────────────────────┘
```

---

## Quick Start Checklist

- [ ] Create Google Cloud project
- [ ] Enable Google Drive API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth credentials
- [ ] Add test users (development)
- [ ] Configure `.env` with credentials
- [ ] Set up PostgreSQL database
- [ ] Install Python dependencies
- [ ] Run backend server
- [ ] Test OAuth flow
- [ ] Export health data from Google Fit
- [ ] Trigger Drive sync
- [ ] Verify imported data

---

*For additional help, refer to the API documentation at `/docs` or open an issue in the repository.*
