You are a senior backend &  AI engineer, healthcare systems architect, and product designer with 10+ years of experience building YC-backed health tech products.

Your task is to generate an END-TO-END, industry-ready project called **Pulse AI**. This project is used in actual world and in critical medical conditions so that there is no room for errors.

========================
PROJECT OVERVIEW
========================
Pulse AI is a continuous clinical surveillance platform that:
• Collects health data from smartwatches, smart rings, and manual user inputs
• Learns a personalized health baseline for each user
• Uses AI to detect sustained health anomalies (clinical drift)
• Generates a CareScore (0–100) to assess risk severity
• Recommends doctor consultation when CareScore > 70
• Never diagnoses disease — only provides early-warning decision support

Pulse AI detects CHANGE, not disease.

========================
DATA SOURCES
========================
Use simulated/mock data for demo.

Wearables / Smart Rings:
• Heart Rate
• HRV
• Sleep Duration & Quality
• Activity Level
• Breathing Rate

Manual User Inputs:
• Blood Pressure
• Blood Sugar
• Symptoms (fatigue, dizziness, gas, etc.)

========================
AI & CARESCORE REQUIREMENTS
========================
Implement AI-driven time-series analysis using:
• LSTM / GRU OR Autoencoder models
• Personalized baseline learning per user
• Detection of sustained deviation (clinical drift)

Define and implement **CareScore (0–100)** exactly as follows:

CareScore Components:
1. Severity Score (0–40)
   – Based on deviation from personal baseline (z-score ranges)
2. Persistence Score (0–25)
   – Based on how long deviation persists
3. Cross-Signal Validation Score (0–20)
   – Number of signals agreeing on drift
4. Manual Risk Modifier (0–10)
   – Based on BP, sugar, symptoms (manual input)

Final CareScore =
Severity + Persistence + Cross-Signal + Manual Modifier
(Normalize to 0–100)

CareScore Interpretation:
• 0–30 → Stable
• 31–50 → Mild
• 51–70 → Moderate
• 71–100 → High → Recommend doctor consultation

Include:
• Explainability (which signals contributed)
• Confidence Score
• Health Stability Score (trend over time)

========================
SMART ESCALATION LOGIC
========================
Pulse AI must NEVER diagnose.

Escalation Levels:
1. Normal monitoring → No alert
2. Early drift → In-app awareness
3. Sustained drift → Caution notification
4. High-confidence anomaly → Doctor consultation recommendation

When escalation triggers:
• Notify user calmly
• Show health summary
• Offer to schedule doctor consultation (mocked)
• Allow user choice

========================
BACKEND REQUIREMENTS
========================
• Language: Python
• Framework: FastAPI
• Database: SQLite
• Endpoints:
   – /ingest
   – /train
   – /analyze
   – /status
   – /carescore
   – /escalate
• Modular architecture (ML, scoring, escalation)

========================
FRONTEND REQUIREMENTS
========================
• Framework: Next.js (App Router)
• Language: TypeScript
• Styling: Tailwind CSS
• Charts: Recharts or Chart.js
• Icons: Lucide

Pages:
• Dashboard
• Insights
• Escalation Screen
• Manual Data Entry
• About Pulse AI

Dashboard must display:
• CareScore
• DriftScore
• Confidence Score
• Stability Score
• Baseline vs current trends
• “What changed?” explanation
• Escalation CTA when CareScore > 70

Design Principles:
• Calm, YC-style UI (Stripe / Linear inspired)
• No panic language
• Healthcare-safe UX
• Human-in-the-loop messaging

========================
SIMULATION
========================
• Generate 30–60 days of realistic synthetic health data
• Introduce gradual degradation (sleep loss, HRV drop, BP increase)
• Show CareScore rising over time
• Demonstrate escalation

========================
OUTPUT REQUIREMENTS
========================
Provide:
• Full project folder structure
• Backend code
• ML code
• Frontend code
• Sample JSON data
• README.md with setup instructions
