

# HydroSentry: Borno State Resilience Command Center

## Overview
A professional humanitarian dashboard for managing dual-crisis scenarios (flooding and drought-related conflict) in Borno State, Nigeria. The application follows a "UN Humanitarian Tech" design aesthetic with a light mode palette and authoritative, data-dense interface.

---

## Design System

**Color Palette:**
- **Background:** White (#ffffff), Slate-50 (#f8fafc)
- **Primary (UN Blue):** #009EDB
- **Alert Red (Flood/Waste):** #ef4444
- **Alert Amber (Drought/Conflict):** #f59e0b
- **Typography:** Inter font family

**Visual Style:** Clean, professional, trustworthy – inspired by World Bank and government dashboards

---

## Page 1: Login Portal

A centered login card with:
- **HydroSentry logo** with shield/water-drop icon in UN Blue
- **Headline:** "Borno State Resilience Command Center"
- **Subtext:** "Authorized Personnel Only"
- Email and password input fields
- "Login to Dashboard" button
- Mock authentication (navigates directly to dashboard)

---

## Page 2: Main Dashboard

### Left Sidebar Navigation
- HydroSentry logo at top
- Navigation items:
  - Overview (active by default)
  - Wet Season (Flood Shield)
  - Dry Season (Conflict Engine)
  - Dispatcher
  - Settings
- User profile at bottom: "Admin: BOSEPA Command"

### Top Metric Bar (4 Cards with Sparklines)
1. **Est. Flood Risk Value:** NGN 28.8B (+12% trend indicator with mini chart)
2. **Active Borehole Failures:** 245 Sites (Critical status badge)
3. **Conflict Probability (7-Day):** 86% High (Yelwata Sector location)
4. **Safe Corridors Active:** 12 Routes (Verified status)

### Interactive Map Area (Leaflet.js with Borno State Geography)

**Season Toggle Switch:** Prominent toggle at map top center

**Wet Season Mode (Default):**
- Red danger zones along Ngadda River path
- 3 alert pins with clickable info:
  - Monday Market Bridge
  - Gwange Drainage
  - Lagos Street Channel
- Pin popup shows: Blockage type, Flood risk level, Action button

**Dry Season Mode:**
- Yellow lines showing Burtali Herder Routes
- Orange dots for broken boreholes
- Pulka Zone C borehole marker
- Popup shows: Status, 'Atmospheric Thirst' Index, CRPD Score, Conflict prediction

### Right Panel: Action Dispatcher
Priority alerts list sorted by urgency:

1. **CRITICAL:** "Waste Blockage at Ngadda Bridge"
   - Recommendation: Deploy Excavator
   - Button: [Dispatch Crew (Est. NGN 50k)]
   
2. **WARNING:** "Borehole Down in Gwoza"
   - Risk: Herder Trespass
   - Button: [Alert Technician]

**Toast Notification:** Success message "Work Order #442 Sent to Ministry of Environment" on dispatch

---

## Technical Implementation

- **Framework:** React with TypeScript, Vite
- **Mapping:** Leaflet.js with OpenStreetMap tiles, centered on Borno State
- **UI Components:** shadcn/ui (cards, buttons, inputs, toggles, toasts)
- **Icons:** lucide-react (Shield, Droplets, AlertTriangle, MapPin)
- **Charts:** recharts for sparkline trends in metric cards
- **Routing:** React Router for login → dashboard navigation
- **Structure:** Backend-ready with mock data hooks for future Supabase integration

---

## Data Structure (Mock, Backend-Ready)

```
- Risk Zones: { id, name, type, coordinates, severity, season }
- Boreholes: { id, location, status, thirstIndex, crpdScore }
- Alerts: { id, priority, title, description, action, estimatedCost }
- Routes: { id, name, coordinates, status, type }
```

This structure allows easy migration to Supabase tables when you're ready to add real data and authentication.

