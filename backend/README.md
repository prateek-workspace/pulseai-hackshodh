# Pulse AI Backend

FastAPI backend for the Pulse AI clinical surveillance platform.

## 🏗️ Architecture

```
app/
├── main.py              # FastAPI application entry point
├── database.py          # Neon PostgreSQL configuration
├── models/              # SQLAlchemy ORM models
│   ├── user.py          # User with baseline values
│   ├── health_data.py   # Health readings from wearables
│   ├── care_score.py    # CareScore & Escalation models
│   └── api_key.py       # API keys & device registration
├── services/            # Business logic layer
│   ├── carescore_engine.py    # CareScore calculation
│   ├── anomaly_detector.py    # Z-score based drift detection
│   ├── escalation_service.py  # Tiered alert generation
│   ├── auth_service.py        # API key management
│   ├── gemini_service.py      # Gemini AI proxy
│   └── synthetic_data.py      # Demo data generator
└── routes/              # API endpoints
    ├── webhook.py       # Health Connect data ingestion
    ├── auth.py          # Authentication & onboarding
    ├── dashboard.py     # Frontend dashboard data
    ├── health.py        # Health data CRUD
    ├── analysis.py      # CareScore computation
    ├── escalation.py    # Alert management
    └── users.py         # User management
```

## 🚀 Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run server
uvicorn app.main:app --reload --port 8000
```

## 📊 Database Models

### User
```python
User:
  - id, email, name, age, gender
  - baseline_heart_rate, baseline_hrv, baseline_sleep_hours
  - baseline_activity_level, baseline_breathing_rate
  - baseline_bp_systolic, baseline_bp_diastolic, baseline_blood_sugar
  - created_at, is_active
```

### HealthData
```python
HealthData:
  - id, user_id, timestamp, source
  - heart_rate, hrv, sleep_duration, sleep_quality
  - activity_level, breathing_rate
  - bp_systolic, bp_diastolic, blood_sugar
  - symptoms, metadata
```

### CareScore
```python
CareScore:
  - id, user_id, timestamp
  - care_score (0-100), status (stable/mild/moderate/high)
  - severity_score, persistence_score, cross_signal_score, manual_modifier_score
  - drift_score, confidence_score, stability_score
  - contributing_signals, explanation
```

### Escalation
```python
Escalation:
  - id, user_id, care_score_id, timestamp
  - level (1-3), message
  - acknowledged, acknowledged_at, action_taken
```

### APIKey
```python
APIKey:
  - id, user_id, key (hashed), name, device_id
  - created_at, last_used_at, expires_at
  - is_active, request_count
```

## 🔌 API Endpoints

### Webhook (Health Connect Ingestion)
- `POST /webhook/ingest` - Single data type
- `POST /webhook/ingest-batch` - Multiple data types
- `POST /webhook/ingest-and-analyze` - Ingest + trigger CareScore
- `GET /webhook/health` - Health check
- `GET /webhook/schema` - Payload schema

### Authentication
- `POST /auth/onboard` - Complete user onboarding
- `POST /auth/api-keys/generate` - Generate API key
- `GET /auth/api-keys/{user_id}` - List keys
- `DELETE /auth/api-keys/{key_id}` - Revoke key
- `POST /auth/devices/register` - Register device
- `GET /auth/validate` - Validate API key

### Dashboard
- `GET /dashboard/summary/{user_id}` - Full dashboard data
- `GET /dashboard/trends/{user_id}` - Health trends
- `GET /dashboard/carescore-history/{user_id}` - Score history
- `GET /dashboard/insights/{user_id}` - AI insights
- `GET /dashboard/escalations/{user_id}` - Escalations

### Analysis
- `POST /analysis/train` - Train baseline
- `POST /analysis/analyze` - Run analysis
- `GET /analysis/carescore/{user_id}` - Get CareScore
- `POST /analysis/carescore/compute` - Compute new score

### Demo
- `POST /demo/generate` - Generate demo data
- `POST /demo/compute-scores` - Compute demo scores

## 🧮 CareScore Algorithm

```
CareScore = Severity(0-40) + Persistence(0-25) + CrossSignal(0-20) + Manual(0-10)

Where:
- Severity: Weighted sum of z-scores for all deviating signals
- Persistence: Days the deviation has been sustained
- CrossSignal: Number of signals agreeing on drift direction
- Manual: Risk from manual inputs (BP, blood sugar, symptoms)
```

### Z-Score Calculation
```python
z_score = (current_value - baseline) / std_deviation

Thresholds:
- |z| < 1.0  → Normal
- |z| < 1.5  → Mild
- |z| < 2.0  → Moderate
- |z| >= 2.0 → Severe
```

## 🔐 Authentication

The backend uses API key authentication for webhook requests:

1. User onboards via `/auth/onboard`
2. Backend generates unique API key: `pulseai_{user_id}_{secret}`
3. Android app stores key and includes in headers:
   ```
   X-API-Key: pulseai_1_xxxxx
   X-Device-ID: android-device-123
   ```

## 📝 Environment Variables

```env
# Neon PostgreSQL
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require

# Gemini API
GEMINI_API_URL=https://your-gemini-api.com

# Server
HOST=0.0.0.0
PORT=8000
```

## 🧪 Testing

```bash
# Generate demo data
curl -X POST http://localhost:8000/demo/generate

# Compute demo scores
curl -X POST http://localhost:8000/demo/compute-scores

# Get dashboard summary
curl http://localhost:8000/dashboard/summary/1

# Test webhook
curl -X POST http://localhost:8000/webhook/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pulseai_1_test" \
  -d '{"dataType": "HeartRate", "records": [{"time": "2026-01-28T10:00:00Z", "value": 75}]}'
```

## 📚 API Documentation

Once running, access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
