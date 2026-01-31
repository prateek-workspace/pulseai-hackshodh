# Pulse AI

<div align="center">

![Pulse AI](https://img.shields.io/badge/Pulse%20AI-Clinical%20Surveillance-6366f1?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon%20PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**Continuous Clinical Surveillance Platform for Early Health Warning**

*Detect change, not disease.*

[Getting Started](#-getting-started) • [How It Works](#-how-it-works) • [API Reference](#-api-reference) • [Architecture](#-system-architecture)

</div>

---

## 🎯 Overview

Pulse AI is a **non-diagnostic clinical surveillance platform** that:

- ✅ **Collects** health data from smartwatches, smart rings, and manual user inputs
- ✅ **Learns** a personalized health baseline for each user
- ✅ **Detects** sustained health anomalies (clinical drift)
- ✅ **Generates** a CareScore (0–100) to assess risk severity
- ✅ **Recommends** doctor consultation when CareScore > 70
- ❌ **Never diagnoses** disease — only provides early-warning decision support

---

## 📁 Project Structure

```
hackshodh/
├── frontend/                    # Next.js 14 TypeScript Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css      # Premium design system
│   │   │   ├── layout.tsx       # Root layout with Inter font
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── about/           # About page
│   │   │   └── dashboard/       # Dashboard pages
│   │   │       ├── page.tsx     # Main CareScore dashboard
│   │   │       ├── insights/    # AI-generated health insights
│   │   │       ├── escalations/ # Alert management
│   │   │       └── manual-entry/# Manual data input
│   │   └── lib/
│   │       └── api.ts           # Backend API service
│   └── package.json
│
├── backend/                     # FastAPI Python Application
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── database.py          # Neon PostgreSQL config
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── health_data.py
│   │   │   ├── care_score.py
│   │   │   └── api_key.py       # API key & device registration
│   │   ├── services/            # Business logic
│   │   │   ├── carescore_engine.py    # CareScore algorithm
│   │   │   ├── anomaly_detector.py    # Drift detection
│   │   │   ├── escalation_service.py  # Smart alerts
│   │   │   ├── auth_service.py        # API key management
│   │   │   ├── synthetic_data.py      # Demo data generator
│   │   │   └── gemini_service.py      # Gemini API proxy
│   │   └── routes/              # API endpoints
│   │       ├── webhook.py       # Health Connect ingestion
│   │       ├── auth.py          # Authentication & API keys
│   │       ├── dashboard.py     # Dashboard data
│   │       ├── health.py        # Health data CRUD
│   │       ├── analysis.py      # CareScore computation
│   │       ├── escalation.py    # Escalation management
│   │       └── users.py         # User management
│   └── requirements.txt
│
├── webhook.md                   # Health Connect integration docs
└── README.md                    # This file
```

---

## 🔄 How It Works

### Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER'S ANDROID DEVICE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │   Fitbit     │   │   Samsung    │   │  Google Fit  │   │   Garmin     │  │
│  │   App        │   │   Health     │   │              │   │   Connect    │  │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘  │
│         │                  │                  │                  │          │
│         └──────────────────┴──────────────────┴──────────────────┘          │
│                                    │                                        │
│                                    ▼                                        │
│                    ┌───────────────────────────────┐                        │
│                    │   Google Health Connect       │                        │
│                    │   (Android System Service)    │                        │
│                    └───────────────┬───────────────┘                        │
│                                    │                                        │
│                                    ▼                                        │
│                    ┌───────────────────────────────┐                        │
│                    │   health-connect-webhook      │                        │
│                    │   (Android Bridge App)        │                        │
│                    └───────────────┬───────────────┘                        │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                                     │ HTTPS POST (JSON)
                                     │ Headers: X-API-Key, X-Device-ID
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PULSE AI BACKEND                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     WEBHOOK INGESTION LAYER                          │   │
│  │  POST /webhook/ingest                                                │   │
│  │  POST /webhook/ingest-batch                                          │   │
│  │  POST /webhook/ingest-and-analyze                                    │   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     DATA NORMALIZATION                               │   │
│  │  • Parse Health Connect JSON                                         │   │
│  │  • Map data types to internal schema                                 │   │
│  │  • Handle multiple record formats                                    │   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     NEON POSTGRESQL DATABASE                         │   │
│  │  Tables: users, health_data, care_scores, escalations, api_keys      │   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     AI ANALYSIS PIPELINE                             │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │   │
│  │  │ Baseline        │  │ Anomaly         │  │ CareScore       │      │   │
│  │  │ Learning        │──▶│ Detection       │──▶│ Engine          │      │   │
│  │  │ (14-day avg)    │  │ (Z-score based) │  │ (0-100 scoring) │      │   │
│  │  └─────────────────┘  └─────────────────┘  └────────┬────────┘      │   │
│  │                                                      │               │   │
│  │                                                      ▼               │   │
│  │                              ┌─────────────────────────────────┐    │   │
│  │                              │ Escalation Service              │    │   │
│  │                              │ (Tiered alert generation)       │    │   │
│  │                              └─────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ REST API
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS FRONTEND                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Dashboard   │  │   Insights   │  │ Escalations  │  │ Manual Entry │    │
│  │  (CareScore) │  │  (AI Tips)   │  │  (Alerts)    │  │  (BP, Sugar) │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📲 Data Ingestion via Webhook

### How Health Data Gets to Pulse AI

1. **Wearable devices** (Fitbit, Samsung, Garmin, etc.) sync to their respective apps
2. **Apps write to Google Health Connect** (Android's unified health data API)
3. **health-connect-webhook app** reads from Health Connect and POSTs to our backend
4. **Pulse AI backend** receives, normalizes, stores, and analyzes the data

### Webhook Endpoint Details

#### Single Data Type Ingestion
```http
POST /webhook/ingest
Headers:
  X-API-Key: pulseai_1_xxxxx
  X-Device-ID: android-device-123
  Content-Type: application/json

Body:
{
  "dataType": "HeartRate",
  "startTime": "2026-01-28T10:00:00Z",
  "endTime": "2026-01-28T10:01:00Z",
  "records": [
    {"time": "2026-01-28T10:00:30Z", "value": 74, "unit": "bpm"}
  ]
}

Response:
{
  "success": true,
  "message": "Ingested 1 records",
  "records_stored": 1,
  "data_type": "HeartRate",
  "user_id": 1
}
```

#### Batch Ingestion (Multiple Data Types)
```http
POST /webhook/ingest-batch
Headers:
  X-API-Key: pulseai_1_xxxxx

Body:
{
  "deviceId": "android-device-123",
  "payloads": [
    {"dataType": "HeartRate", "records": [...]},
    {"dataType": "Steps", "records": [...]},
    {"dataType": "SleepSession", "startTime": "...", "endTime": "...", "records": [...]}
  ]
}
```

#### Ingest + Analyze (Trigger CareScore Computation)
```http
POST /webhook/ingest-and-analyze
Headers:
  X-API-Key: pulseai_1_xxxxx

Response:
{
  "success": true,
  "records_stored": 5,
  "analysis": {
    "care_score": 47,
    "status": "mild",
    "drift_score": 32,
    "confidence": 78,
    "explanation": "Your sleep duration has decreased..."
  },
  "escalation": {
    "triggered": false,
    "level": null,
    "message": null
  }
}
```

### Supported Health Data Types

| Data Type | Internal Mapping | Example Value |
|-----------|------------------|---------------|
| `HeartRate` | `heart_rate` | 74 bpm |
| `RestingHeartRate` | `heart_rate` | 62 bpm |
| `HRV` | `hrv` | 45 ms |
| `SleepSession` | `sleep_duration`, `sleep_quality` | 7.5 hours |
| `Steps` | `activity_level` | 8500 steps |
| `BloodPressure` | `bp_systolic`, `bp_diastolic` | 120/80 mmHg |
| `BloodGlucose` | `blood_sugar` | 100 mg/dL |
| `RespiratoryRate` | `breathing_rate` | 15 breaths/min |
| `SpO2` | (stored as metadata) | 98% |
| `ActiveCalories` | `activity_level` | 350 kcal |

---

## 🧠 AI Analysis Pipeline

### 1. Baseline Learning

When a user first starts, Pulse AI collects **14 days** of health data to establish their personal baseline:

```python
# Baseline calculation for each signal
baseline_heart_rate = mean(last_14_days.heart_rate)
baseline_hrv = mean(last_14_days.hrv)
baseline_sleep = mean(last_14_days.sleep_duration)
# ... for all signals
```

### 2. Anomaly Detection (Z-Score Based)

For each new reading, we calculate how far it deviates from the baseline:

```python
z_score = (current_value - baseline) / std_deviation

# Classification
if abs(z_score) < 1.0:   level = "normal"
elif abs(z_score) < 1.5: level = "mild"
elif abs(z_score) < 2.0: level = "moderate"
else:                     level = "severe"
```

### 3. CareScore Algorithm

CareScore is a **transparent, explainable** risk metric composed of 4 components:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CareScore Calculation                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐                                              │
│  │   SEVERITY    │  0-40 points                                 │
│  │   Score       │  How far from baseline (z-score weighted)    │
│  └───────┬───────┘                                              │
│          │                                                      │
│          ▼                                                      │
│  ┌───────────────┐                                              │
│  │  PERSISTENCE  │  0-25 points                                 │
│  │   Score       │  How long the deviation has lasted           │
│  └───────┬───────┘                                              │
│          │                                                      │
│          ▼                                                      │
│  ┌───────────────┐                                              │
│  │ CROSS-SIGNAL  │  0-20 points                                 │
│  │   Score       │  How many signals agree on the drift         │
│  └───────┬───────┘                                              │
│          │                                                      │
│          ▼                                                      │
│  ┌───────────────┐                                              │
│  │    MANUAL     │  0-10 points                                 │
│  │   Modifier    │  Risk from BP, blood sugar, symptoms         │
│  └───────┬───────┘                                              │
│          │                                                      │
│          ▼                                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  FINAL CARESCORE = Severity + Persistence + CrossSignal   │  │
│  │                    + ManualModifier                        │  │
│  │                                                            │  │
│  │                    Range: 0-100                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. CareScore Interpretation

| Score | Status | Color | Action |
|-------|--------|-------|--------|
| 0-30 | **Stable** | 🟢 Green | No action needed |
| 31-50 | **Mild** | 🔵 Blue | Monitor and observe |
| 51-70 | **Moderate** | 🟡 Yellow | Pay attention to changes |
| 71-100 | **High** | 🔴 Red | Consider consulting a doctor |

### 5. Escalation Service

Based on CareScore, the system generates tiered alerts:

| Level | Trigger | Action |
|-------|---------|--------|
| 1 (Awareness) | CareScore 30-50 | Informational insight |
| 2 (Attention) | CareScore 51-70 | Recommend monitoring |
| 3 (Consultation) | CareScore 71+ | Recommend doctor visit |

---

## 🔐 Authentication & API Keys

### Onboarding Flow

```http
POST /auth/onboard

Body:
{
  "email": "user@example.com",
  "name": "John Doe",
  "device_id": "android-xxx-123",
  "device_name": "Samsung Galaxy S24"
}

Response:
{
  "success": true,
  "user": {"id": 1, "email": "user@example.com", "name": "John Doe"},
  "api_key": "pulseai_1_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456",
  "device": {"id": 1, "device_id": "android-xxx-123"},
  "webhook_config": {
    "endpoint": "/webhook/ingest",
    "headers": {
      "X-API-Key": "pulseai_1_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456",
      "X-Device-ID": "android-xxx-123"
    }
  }
}
```

The returned `api_key` is used in all webhook requests from the Android app.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Neon PostgreSQL** account (or local PostgreSQL)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Neon database URL and Gemini API URL

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Generate demo data (optional)
curl -X POST http://localhost:8000/demo/generate
curl -X POST http://localhost:8000/demo/compute-scores
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local if backend is on different URL

# Run development server
npm run dev

# Open in browser
open http://localhost:3000
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@your-neon-host.neon.tech/dbname?sslmode=require
GEMINI_API_URL=https://your-gemini-api.com
HOST=0.0.0.0
PORT=8000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📡 API Reference

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/summary/{user_id}` | Complete dashboard data |
| GET | `/dashboard/trends/{user_id}` | Health metric trends |
| GET | `/dashboard/carescore-history/{user_id}` | CareScore history |
| GET | `/dashboard/insights/{user_id}` | AI-generated insights |
| GET | `/dashboard/escalations/{user_id}` | User's escalations |
| POST | `/dashboard/escalations/{id}/acknowledge` | Acknowledge alert |

### Webhook Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook/ingest` | Single data type ingestion |
| POST | `/webhook/ingest-batch` | Multiple data types |
| POST | `/webhook/ingest-and-analyze` | Ingest + trigger analysis |
| GET | `/webhook/health` | Webhook health check |
| GET | `/webhook/schema` | Expected payload schema |

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/onboard` | Complete user onboarding |
| POST | `/auth/api-keys/generate` | Generate API key |
| GET | `/auth/api-keys/{user_id}` | List user's API keys |
| DELETE | `/auth/api-keys/{key_id}` | Revoke API key |
| POST | `/auth/devices/register` | Register device |
| GET | `/auth/devices/{user_id}` | List user's devices |
| GET | `/auth/validate` | Validate API key |

### Analysis Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analysis/train` | Train user baseline |
| POST | `/analysis/analyze` | Analyze current health |
| GET | `/analysis/carescore/{user_id}` | Get latest CareScore |
| POST | `/analysis/carescore/compute` | Compute new CareScore |

### Demo Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/demo/generate` | Generate demo data |
| POST | `/demo/compute-scores` | Compute demo CareScores |

---

## 🎨 Frontend Design System

The UI follows a **calm, industrial, serious** aesthetic:

- **White-dominant** with black typography
- **Accent colors:**
  - Indigo (#6366F1) - Trust, Intelligence
  - Emerald (#10B981) - Health, Growth
  - Amber (#F59E0B) - Caution, Attention
  - Red (#EF4444) - Danger, High Risk
- **Typography**: Inter font family
- **Motion**: Subtle, intentional scroll animations
- **No flashy/gimmicky effects**

---

## ⚠️ Important Disclaimers

### What Pulse AI Does NOT Do

| ❌ Does NOT | Explanation |
|------------|-------------|
| Diagnose diseases | We detect change, not disease |
| Replace doctors | Always consult healthcare professionals |
| Provide treatment | No medication or therapy recommendations |
| Handle emergencies | Call emergency services for urgent issues |

### What Pulse AI DOES Provide

| ✅ Does | Explanation |
|---------|-------------|
| Early awareness | Detect health pattern changes early |
| Personalized baselines | Learn YOUR normal patterns |
| Transparent scoring | Explainable CareScore with components |
| Calm recommendations | Suggest professional consultation when appropriate |

---

## 🛠️ Technology Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Vanilla CSS (design system)
- Recharts (charts)
- Lucide Icons
- Framer Motion (animations)

### Backend
- FastAPI (Python 3.10+)
- SQLAlchemy (ORM)
- Neon PostgreSQL (database)
- Pydantic (validation)
- NumPy/Pandas (data analysis)

### Integration
- health-connect-webhook (Android data bridge)
- Gemini API (AI insights)

---

## 📄 License

MIT License - See LICENSE file for details.

---

<div align="center">

**Pulse AI** - Early warning, not diagnosis.
Developed by Prateek Sriavastava, Prakhar Singh and Prakhar Dixit
Made with ❤️ for proactive health

</div>
