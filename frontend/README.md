# Pulse AI Frontend

Next.js 14 frontend for the Pulse AI clinical surveillance platform.

## 🎨 Design Philosophy

The UI follows a **calm, industrial, serious** aesthetic inspired by YC-level health tech startups:

- **White-dominant** with black typography
- **Minimal** but futuristic
- **Premium typography** with Inter font
- **Subtle animations** - intentional, physical, no gimmicks
- **Gallery-like experience** - each section is an "art piece"

## 🎯 Color System

```css
/* Primary Accents */
--color-accent-primary: #6366F1;      /* Indigo - Trust */
--color-accent-secondary: #10B981;    /* Emerald - Health */
--color-accent-warning: #F59E0B;      /* Amber - Caution */
--color-accent-danger: #EF4444;       /* Red - Danger */

/* Typography */
--color-white: #FFFFFF;
--color-black: #0A0A0A;
--color-gray-50 to --color-gray-900;
```

## 📁 Structure

```
src/
├── app/
│   ├── globals.css          # Design system & CSS variables
│   ├── layout.tsx           # Root layout with Inter font
│   ├── page.tsx             # Landing page (scroll animations)
│   ├── about/
│   │   └── page.tsx         # About Pulse AI
│   └── dashboard/
│       ├── layout.tsx       # Dashboard layout
│       ├── page.tsx         # Main CareScore dashboard
│       ├── insights/
│       │   └── page.tsx     # AI-generated insights
│       ├── escalations/
│       │   └── page.tsx     # Alert management
│       └── manual-entry/
│           └── page.tsx     # Manual data input
└── lib/
    └── api.ts               # Backend API service
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## 📱 Pages

### Landing Page (`/`)
- Hero section with scroll animations
- Feature highlights
- How it works section
- CTA to dashboard

### Dashboard (`/dashboard`)
- CareScore visualization (circular gauge)
- Score breakdown (4 components)
- Current health metrics
- Trend charts (7-day history)
- Active escalation alerts

### Insights (`/dashboard/insights`)
- AI-generated health observations
- Comparison to baseline
- Recommendations for each metric
- Color-coded severity levels

### Escalations (`/dashboard/escalations`)
- Active alerts requiring attention
- Acknowledgment actions
- Past alerts history
- Tiered severity display

### Manual Entry (`/dashboard/manual-entry`)
- Blood pressure input (systolic/diastolic)
- Blood sugar input
- Symptom selection
- Form validation

### About (`/about`)
- Platform mission
- CareScore algorithm explanation
- What we do/don't do disclaimers
- Privacy section

## 🔌 API Integration

The `api.ts` service handles all backend communication:

```typescript
import { api } from '@/lib/api';

// Dashboard data
const summary = await api.getDashboardSummary(userId);
const trends = await api.getHealthTrends(userId, 7);
const insights = await api.getInsights(userId);

// CareScore
const score = await api.getCareScore(userId);
const history = await api.getCareScoreHistory(userId, 30);

// Escalations
const escalations = await api.getEscalations(userId);
await api.acknowledgeEscalation(escalationId, 'dismissed');

// Auth
const result = await api.onboardUser(email, name, deviceId);
const apiKey = await api.generateApiKey(userId);
```

## 🎨 Component Patterns

### Cards
```css
.card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.card-elevated {
  box-shadow: var(--shadow-lg);
}

.card-flat {
  background: var(--color-gray-50);
  box-shadow: none;
}
```

### Badges
```css
.badge { /* Base badge styles */ }
.badge-stable { /* Green for stable */ }
.badge-mild { /* Blue for mild */ }
.badge-moderate { /* Yellow for moderate */ }
.badge-high { /* Red for high */ }
```

### Buttons
```css
.btn { /* Base button */ }
.btn-primary { /* Indigo filled */ }
.btn-secondary { /* Gray outline */ }
.btn-ghost { /* Transparent */ }
.btn-accent { /* Amber filled */ }
```

### Alerts
```css
.alert { /* Base alert */ }
.alert-success { /* Green border */ }
.alert-warning { /* Yellow border */ }
.alert-danger { /* Red border */ }
```

## 📊 CareScore Visualization

The dashboard uses a circular gauge to display CareScore:

```tsx
// Conic gradient for circular progress
<div style={{
  background: `conic-gradient(
    ${getStatusColor(status)} ${score * 3.6}deg,
    var(--color-gray-200) ${score * 3.6}deg
  )`
}} />
```

Color mapping:
- 0-30 (Stable): Emerald
- 31-50 (Mild): Indigo
- 51-70 (Moderate): Amber
- 71-100 (High): Red

## 📱 Responsive Design

The dashboard uses a sidebar layout on desktop and adapts for mobile:

```css
.dashboard {
  display: grid;
  grid-template-columns: 260px 1fr;
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  .sidebar {
    transform: translateX(-100%);
  }
}
```

## 🔧 Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📦 Dependencies

```json
{
  "next": "14.2.0",
  "react": "^18.2.0",
  "recharts": "^2.12.0",
  "lucide-react": "^0.312.0",
  "framer-motion": "^11.0.0"
}
```

## 🧪 Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🎯 Key Features

1. **Premium Design**: YC-level aesthetics with calm, industrial feel
2. **Real-time Data**: Fetches from FastAPI backend
3. **CareScore Visualization**: Intuitive circular gauge
4. **AI Insights**: Generated from health patterns
5. **Escalation Management**: Tiered alert system
6. **Manual Entry**: For non-wearable data
7. **Responsive**: Works on desktop and mobile

---

Built with Next.js 14, TypeScript, and ❤️ for proactive health
