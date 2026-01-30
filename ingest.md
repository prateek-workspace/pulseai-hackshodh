
# Drive-Based Health Data Ingestion – Technical Approach
## Pulse AI (Batch Ingestion, Web-Only)

---

## 1. Context & Motivation

Pulse AI requires **longitudinal health data** to:
- Learn personalized baselines
- Detect sustained physiological drift
- Compute CareScore
- Generate early health warnings (non-diagnostic)

Instead of relying on:
- Mobile SDKs
- Android webhooks
- Health Connect bridges
- Real-time streaming

We adopt a **batch-first ingestion strategy** using **Google Fit exports stored in Google Drive**.

This approach is:
- Free
- Web-only
- User-consented
- Easy to debug
- Ideal for baseline & trend analysis

---

## 2. High-Level Technical Idea

> Google Fit aggregates data from wearables → user exports data to Drive as ZIP → backend reads ZIP via Google Drive API → extracts SQLite DB → parses & normalizes data → feeds Pulse AI agents.

No mobile app, no webhook, no device-side process.

---

## 3. System Architecture

```

Wearables / Devices
(Fitbit, Samsung, Phone Sensors)
↓
Google Fit
↓
User-Initiated Export
↓
Google Drive (ZIP file)
↓
Backend Drive Ingestion Service
↓
ZIP → SQLite Extraction
↓
Data Normalization
↓
Pulse AI Agents
(Baseline, Drift, CareScore, Escalation)

```

---

## 4. Ingestion Model (Batch-Oriented)

- Data arrives in **batches**, not streams
- Each batch represents a **historical snapshot**
- Batches are idempotent (can be safely reprocessed)
- Suitable for:
  - Cold-start baseline training
  - Backfilling history
  - Periodic health trend updates

---

## 5. Backend Responsibilities (Clear Separation)

### The backend ingestion service is responsible for:

1. Authenticating user via Google OAuth
2. Accessing user’s Google Drive
3. Locating health export ZIP files
4. Downloading ZIP files
5. Extracting contents
6. Locating SQLite `.db` file
7. Parsing all health tables
8. Normalizing data into Pulse AI schema
9. Persisting data (Supabase / DB)
10. Triggering AI agents

**No AI logic exists in the ingestion layer.**

---

## 6. Google APIs Used

### Required APIs
- **Google Drive API**
  - List files
  - Download ZIP files

### OAuth Scope (Minimum)
```

[https://www.googleapis.com/auth/drive.readonly](https://www.googleapis.com/auth/drive.readonly)

```

No Google Fit API is required.

---

## 7. Drive Access Strategy

### Assumptions
- User exports Google Fit data manually
- ZIP file exists in Drive (e.g. `Health Connect.zip`)
- Backend is granted Drive access via OAuth

### File Identification
- By filename (e.g. `Health Connect.zip`)
- OR by folder (recommended for safety)

---

## 8. ZIP Processing Pipeline

### ZIP Contents (Typical)
```

Health Connect.zip
├── health_connect_export.db   ← primary data source

````

### Processing Steps
1. Download ZIP to temp directory
2. Extract ZIP
3. Recursively scan for `.db` file
4. Validate SQLite file
5. Pass DB path to extractor

---

## 9. SQLite Extraction Strategy

- Use SQLite reader
- Dynamically inspect tables
- Extract:
  - Heart rate
  - Steps
  - Sleep sessions
  - Activity segments
  - Calories
  - Respiration (if available)

All records are timestamped and unit-consistent.

---

## 10. Normalization Layer (Critical)

Raw Google Fit semantics are **never used directly** by AI.

They are mapped to Pulse AI signals.

### Example Mapping

| Google Fit Type | Pulse AI Signal |
|-----------------|----------------|
| heart_rate.bpm | heart_rate |
| steps.count | activity_level |
| sleep.duration | sleep_duration |
| sleep.stage | sleep_quality |
| respiratory_rate | breathing_rate |

### Normalized Record

```json
{
  "user_id": 123,
  "source": "google_fit_export",
  "timestamp": "2026-01-28T10:00:30Z",
  "heart_rate": 74,
  "sleep_duration": null,
  "activity_level": 0.42
}
````

---

## 11. Feeding Pulse AI Agents

After normalization and persistence:

1. Baseline Agent
2. Drift Detection Agent
3. CareScore Engine
4. Escalation Engine

Agents operate on **historical + recent data**, not live streams.

---

## 12. Idempotency & Safety

To prevent duplicate ingestion:

* Store processed Drive file IDs
* Skip files already ingested
* Each ZIP is processed once

This ensures:

* Safe retries
* No duplicated health records
* Predictable AI behavior

---

## 13. Limitations (Explicit by Design)

* Not real-time
* Depends on export frequency
* Not suitable for emergency alerts

This is acceptable because:

> Pulse AI detects **change over time**, not acute emergencies.

---

## 14. Why Developers Should Use This Approach

* Simple to implement
* Easy to test locally
* No mobile complexity
* No webhook reliability issues
* Clean data boundaries
* Excellent for AI experimentation

---

## 15. One-Line Summary for Developers

> “We ingest Google Fit exports from Drive as ZIP files, extract a SQLite database, normalize health data, and feed it into Pulse AI’s batch analysis pipeline.”

---
