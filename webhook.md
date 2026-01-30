Below is a **single, clean, copy-paste ready Markdown file** you can directly share with your developer or put into your repo as
`docs/health-connect-webhook-architecture.md`.

I’ve written it in **engineering / system-design language**, not marketing fluff.

---

```markdown
# Health Connect Webhook – Technical Architecture & Integration Guide
*(Context for Pulse AI)*

## Repository
https://github.com/mcnaveen/health-connect-webhook

---

## 1. Purpose of This Repository

This repository implements an **Android-based data bridge** that:

- Reads health data from **Google Health Connect**
- Runs entirely on the **user’s Android device**
- Periodically forwards health data to a **remote backend via HTTP webhook**
- Outputs health data in **JSON format**

This repo **does NOT**:
- Perform AI or analytics
- Store data permanently
- Provide a cloud API
- Diagnose or interpret medical data

It is strictly a **transport layer** for wearable health data.

---

## 2. Why This Repo Is Used in Pulse AI

Pulse AI requires:
- Free
- Legal
- Non-diagnostic
- Real wearable time-series data
- Web-app–friendly ingestion (via backend)

This repo enables:
- Multi-wearable ingestion (Fitbit, Samsung, Google Fit, etc.)
- Without vendor OAuth
- Without paid aggregators
- Using a simple webhook POST

---

## 3. High-Level Architecture

```

Wearable Devices / Health Apps
(Fitbit, Samsung Health, Google Fit, etc.)
↓
Google Health Connect
(Android system service)
↓
health-connect-webhook
(Android app)
↓  HTTPS POST (JSON)
Pulse AI Backend
(FastAPI)
↓
Normalize → Store → AI Pipeline

````

Key point:
- **No direct wearable → web connection exists**
- Android device acts as a secure intermediary

---

## 4. Data Source (Input)

### Primary Input
- Local **Google Health Connect database** on Android

### Health Connect aggregates data from:
- Fitbit
- Samsung Health
- Google Fit
- Xiaomi Health
- Garmin (partial)
- Other Android health apps

### Permission Model
- User explicitly grants access per data type
- App can only read approved signals

---

## 5. Supported Health Data Types

The repo reads the following Health Connect records (depending on permissions):

- Heart Rate
- Resting Heart Rate
- HRV
- Sleep Sessions & Stages
- Steps
- Distance
- Active / Total Calories
- Blood Pressure
- Blood Glucose
- SpO₂
- Body Temperature
- Respiratory Rate
- Weight
- Hydration
- Nutrition (macros)

---

## 6. Internal Processing Flow (Android App)

1. App is installed on Android device
2. User grants Health Connect permissions
3. App schedules a background sync job
4. For each permitted data type:
   - Query Health Connect records
   - Convert records into JSON
5. JSON is POSTed to configured webhook endpoint

Notes:
- Runs fully on-device
- No UI interaction required after setup
- Sync is periodic (not real-time streaming)

---

## 7. Output: Webhook Payload Format

The app sends **one payload per data type per sync cycle**.

### 7.1 Generic Payload Structure

```json
{
  "dataType": "HeartRate",
  "startTime": "2026-01-28T10:00:00Z",
  "endTime": "2026-01-28T10:01:00Z",
  "records": [
    {
      "time": "2026-01-28T10:00:30Z",
      "value": 74,
      "unit": "bpm"
    }
  ]
}
````

---

### 7.2 Sleep Session Example

```json
{
  "dataType": "SleepSession",
  "startTime": "2026-01-27T23:10:00Z",
  "endTime": "2026-01-28T06:15:00Z",
  "records": [
    {
      "stage": "DEEP",
      "startTime": "2026-01-28T01:20:00Z",
      "endTime": "2026-01-28T02:10:00Z"
    }
  ]
}
```

---

### 7.3 Blood Pressure Example

```json
{
  "dataType": "BloodPressure",
  "records": [
    {
      "time": "2026-01-28T09:30:00Z",
      "systolic": 124,
      "diastolic": 82,
      "unit": "mmHg"
    }
  ]
}
```

---

## 8. Webhook Contract (Backend Expectations)

The app expects:

* An HTTPS endpoint
* Accepts `POST` requests
* Accepts JSON payload
* Returns HTTP `200 OK`

Example endpoint:

```
POST /ingest-webhook
Content-Type: application/json
```

Authentication:

* Optional
* Token-based auth recommended for production

---

## 9. Backend Responsibilities (Pulse AI Side)

### 9.1 Required Backend Actions

* Validate incoming payload
* Identify user (device token / API key)
* Normalize data into Pulse AI schema
* Store raw + processed records
* Trigger AI analysis pipeline

---

### 9.2 Recommended Normalized Schema (Internal)

```json
{
  "user_id": "uuid",
  "timestamp": "2026-01-28T10:00:30Z",
  "source": "health_connect",
  "signals": {
    "heart_rate": 74,
    "hrv": null,
    "sleep_quality": null,
    "activity_level": null,
    "breathing_rate": null
  },
  "manual_inputs": {
    "bp_systolic": 124,
    "bp_diastolic": 82,
    "blood_sugar": null,
    "symptoms": []
  }
}
```

This normalized format is what feeds:

* Baseline learning
* Drift detection
* CareScore computation

---

## 10. Strengths of This Approach

* Free (no API costs)
* Legal & compliant
* Multi-wearable support
* No OAuth complexity
* Privacy-first (on-device permissions)
* Works well with web apps via backend

---

## 11. Limitations & Constraints

* Android-only
* Requires Health Connect installed
* Requires app to remain installed
* No guaranteed delivery retries
* No iOS / Apple Watch support
* Schema may change (versioning needed)

---

## 12. Recommended Usage in Pulse AI

This repo should be treated as:

> A device-side data forwarder, not a core system component.

All intelligence, validation, scoring, and escalation logic must live in:

* FastAPI backend
* AI modules
* CareScore engine

---

## 13. Summary (One-Liner for Developers)

> “health-connect-webhook is an Android app that reads user-approved health data from Google Health Connect and POSTs structured JSON to our backend. We ingest, normalize, and analyze this data for Pulse AI.”
