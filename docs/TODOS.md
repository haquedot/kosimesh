# Kosi Mesh Admin — Master Implementation Task List (TODOS)

> **Document Status**: Ready for Execution  
> **Source Plan**: [`docs/IMPLEMENTATION_PLAN.md`](file:///e:/Deepmind%20Hackathon/kosi-mesh-admin/docs/IMPLEMENTATION_PLAN.md)  
> **Target Region**: Kosi River Basin, Bihar (Emergency Flood Response)

---

## Progress Overview

| Phase | Description | Status | Total Tasks | Completed |
| :--- | :--- | :---: | :---: | :---: |
| **Phase 1** | Foundation, Types & Data Layer | ✅ Completed | 8 | 8 |
| **Phase 2** | Gemini AI Severity Triage Engine | ✅ Completed | 6 | 6 |
| **Phase 3** | Live GIS Map & Mesh Node Telemetry HUD | ✅ Completed | 7 | 7 |
| **Phase 4** | Emergency Triage Inbox & AI Insight Drawer | ✅ Completed | 7 | 7 |
| **Phase 5** | Two-Way Dispatch & Field Coordination | ✅ Completed | 6 | 6 |
| **Phase 6** | Field Activity & Mesh Simulation Engine | ✅ Completed | 5 | 5 |
| **Phase 7** | Polish, Audio/Visual Alerts & Final QA | ✅ Completed | 6 | 6 |
| **Total** | | | **45 Tasks** | **45 / 45** |

---

## Phase 1: Foundation, Types & Data Layer

- [x] **1.1. Schema & TypeScript Types Definition**
  - **File**: `types/schema.ts`
  - Define `ConnectedDevice`, `DeviceRole`, `DeviceType`, `DeviceStatus`.
  - Define `Message`, `PriorityLevel`, `MessageType`, `MessageStatus`.
  - Define `GeminiAnalysisResult` and `SimulationState`.

- [x] **1.2. MongoDB Integration & Persistent Data Store with In-Memory Fallback**
  - **Files**: `lib/db/mongodb.ts`, `lib/db/store.ts`, `.env.local`, `.env.local.example`
  - Setup MongoDB connection pooling client with Next.js HMR support.
  - Setup environment variables for `MONGODB_URI` and `MONGODB_DB`.
  - Implement atomic reads/writes, automatic MongoDB sync, and in-memory fallback.
  - CRUD helper methods for devices: `getDevices()`, `getDeviceById()`, `upsertDevice()`, `updateHeartbeat()`.
  - CRUD helper methods for messages: `getMessages()`, `getMessageById()`, `createMessage()`, `updateMessageStatus()`, `addReply()`.

- [x] **1.3. Realistic Kosi Flood Seed Data**
  - **File**: `lib/db/seed.ts`
  - 6 initial mesh nodes:
    - `BOAT-ALPHA` (Responder - Supaul Sector 2B, Lat: 26.1201, Lng: 86.5902, Battery: 88%)
    - `BOAT-BRAVO` (Responder - Saharsa Sector 1A, Lat: 26.1380, Lng: 86.6120, Battery: 64%)
    - `BASE-STATION-01` (Base Station - Supaul HQ, Lat: 26.1150, Lng: 86.5850, Battery: 100%)
    - `NODE-USR-101` (Citizen - Supaul Ward 4, Lat: 26.1250, Lng: 86.5950, Battery: 34%)
    - `NODE-USR-102` (Citizen - Saharsa East, Lat: 26.1410, Lng: 86.6200, Battery: 19%)
    - `DRONE-RECON-01` (Drone - River Corridor, Lat: 26.1300, Lng: 86.6000, Battery: 72%)
  - 4 initial emergency messages (P1 roof-trapped SOS, P2 fuel request, P3 water level advisory, P4 status ping).

- [x] **1.4. Device Registration API Endpoint**
  - **File**: `app/api/devices/register/route.ts`
  - `POST`: Register a new device or update metadata.

- [x] **1.5. Device Heartbeat API Endpoint**
  - **File**: `app/api/devices/heartbeat/route.ts`
  - `POST`: Ingest live GPS coordinates, battery level, and node connectivity status.

- [x] **1.6. Devices List & Detail API Endpoints**
  - **File**: `app/api/devices/route.ts` & `app/api/devices/[id]/route.ts`
  - `GET /api/devices`: List all devices with query filtering (`?role=RESPONDER&status=ONLINE`).
  - `GET /api/devices/[id]`: Get single device telemetry.

- [x] **1.7. Messages Ingestion & List API Endpoint**
  - **File**: `app/api/messages/route.ts`
  - `GET /api/messages`: Return messages with priority/status/role filters and search query.
  - `POST /api/messages`: Ingest new SOS / field report.

- [x] **1.8. Phase 1 Verification**
  - Test device registration and heartbeat persistence via API curl / unit test.
  - Verify seed data loads properly upon startup.

---

## Phase 2: Gemini AI Severity Triage Engine

- [x] **2.1. Environment Configuration & SDK Setup**
  - **Files**: `.env.local.example`, `lib/gemini/client.ts`
  - Add `GEMINI_API_KEY` configuration.
  - Initialize Google Gemini SDK client (`@google/genai` or `@google/generative-ai` with `gemini-2.5-flash` or `gemini-1.5-flash`).

- [x] **2.2. Structured Output Triage Prompt & Response Schema**
  - **File**: `lib/gemini/triage.ts`
  - Define structured JSON schema enforcing:
    - `severity`: `"P1" | "P2" | "P3" | "P4"`
    - `severityLabel`: `"CRITICAL" | "HIGH" | "MODERATE" | "LOW"`
    - `confidence`: number (0-1)
    - `reason`: string
    - `casualties`: integer
    - `vulnerabilities`: array of strings
    - `urgency`: `"IMMEDIATE" | "HIGH" | "MEDIUM" | "LOW"`
    - `recommendedAction`: string

- [x] **2.3. Heuristic Fallback Classifier**
  - **File**: `lib/gemini/fallback.ts`
  - Implement keyword and pattern-based emergency classifier (e.g. keywords: *"trapped"*, *"drowning"*, *"children"*, *"roof"*, *"chest deep"*) to ensure 100% resilience if offline or rate-limited.

- [x] **2.4. Automatic AI Analysis Hook on Message Ingestion**
  - **File**: `app/api/messages/route.ts`
  - When a message is posted, invoke `analyzeEmergencyMessage(text, metadata)` and store `geminiAnalysis` in the record.

- [x] **2.5. Dedicated Triage Test / On-Demand API**
  - **File**: `app/api/gemini/triage/route.ts`
  - `POST`: Allow manual on-demand re-analysis or testing of any text snippet.

- [x] **2.6. Phase 2 Verification**
  - Test sample emergency phrases:
    - *"5 people trapped on roof with rising water"* -> Expect `P1 Critical`.
    - *"Boat is running low on diesel in Sector 2"* -> Expect `P2 High`.
    - *"Water level increased by 2 inches overnight"* -> Expect `P3 Moderate`.
    - *"Checking radio connectivity from base camp"* -> Expect `P4 Low`.

---

## Phase 3: Live GIS Map & Mesh Node Telemetry HUD

- [x] **3.1. Map Library Setup & Dynamic Loading**
  - **Packages**: `leaflet`, `@types/leaflet`, `react-leaflet`.
  - Setup SSR-safe dynamic import for client-rendered map.

- [x] **3.2. Tactical Satellite / Flood Terrain Map Component**
  - **File**: `components/map/LiveMeshMap.tsx`
  - Render Esri World Imagery satellite layer with geographic watermarks for Madhubani, Supaul, Saharsa, Madhepura, and Kosi River Corridor.
  - Center on Kosi River Basin (`26.1300° N, 86.6050° E`).

- [x] **3.3. Custom SVG Node Markers**
  - **File**: `components/map/LiveMeshMap.tsx`
  - 🚤 **Responders**: Orange circle with boat icon for rescue vessels (Boat Alpha, Boat Bravo).
  - 🚨 **Citizen SOS**: Red pulsing radar markers for active P1/P2 incidents.
  - 👤 **Citizens**: Orange circle with user icon.

- [x] **3.4. Node Telemetry HUD / Popup**
  - **File**: `components/map/LiveMeshMap.tsx`
  - Interactive popup displaying: Incident priority, message snippet, location name, timestamp, and "View AI Assessment" trigger.

- [x] **3.5. Incident Location Overlay & Danger Heat Zones**
  - **File**: `components/map/LiveMeshMap.tsx`
  - Geographic watermarks and Kosi River corridor highlighting.

- [x] **3.6. Map Controls & Layer Toggles**
  - **File**: `components/map/LiveMeshMap.tsx`
  - Filters: `All Devices`, `All Roles`, `All Severity`.
  - Floating controls: Layer switcher, GPS recenter, Zoom `+` / `-`.

- [x] **3.7. Connected Devices Table Card**
  - **File**: `components/devices/ConnectedDevicesTable.tsx`
  - Compact dashboard table matching `UI.png` (Device ID, User Avatar/Icon, Role badge, Location & GPS coordinates, Battery progress bar, Online/Offline status dot, Last seen timestamp).

- [x] **3.8. Phase 3 Verification**
  - Tested client-side dynamic loading and verified with `npm run typecheck` (0 errors).

---

## Phase 4: Emergency Triage Inbox & AI Insight Drawer

- [x] **4.1. Command Center Dashboard Layout**
  - **File**: `app/page.tsx`, `components/dashboard/CommandDashboard.tsx`, `components/dashboard/Sidebar.tsx`, `components/dashboard/Header.tsx`, `components/dashboard/KPICards.tsx`
  - Split-pane layout matching `UI.png`: Left Sidebar with KosiMesh logo and nav items, Top Header with Search, Bell (badge 12), and Admin Avatar, Top 4 KPI Cards (Total Messages 24, Critical P1 6, Active Responders 8, Connected Devices 37).

- [x] **4.2. Priority Filter Bar HUD & Recent Messages Card**
  - **File**: `components/triage/RecentMessagesCard.tsx`
  - Filter tabs: `All 24`, `P1 6`, `P2 8`, `P3 7`, `P4 3`.
  - Message cards with priority badges, user/boat icons, locations, times, and `New` tags.

- [x] **4.3. Severity Distribution (Gemini Analysis) Bar Chart**
  - **File**: `components/triage/SeverityDistributionChart.tsx`
  - Visual distribution bars: P1 Critical (Red, 6), P2 High (Orange, 8), P3 Moderate (Amber, 7), P4 Low (Slate, 3).

- [x] **4.4. Gemini AI Assessment Drawer / Modal**
  - **File**: `components/triage/GeminiInsightDrawer.tsx`
  - Full distress report details, Gemini AI Assessment Box with Confidence score, Casualties count, Urgency level, Risk factor tags, AI Reasoning, and Recommended Operational Action.

- [x] **4.5. Human-in-the-Loop Triage Actions**
  - **File**: `components/triage/GeminiInsightDrawer.tsx`
  - Action buttons: `Acknowledge`, `Assign Boat/Unit`, `Severity Override (P1-P4)`, `Reply / Send ETA`, and `Mark Resolved`.

- [x] **4.6. Incident Status Lifecycle API**
  - **File**: `app/api/messages/[id]/status/route.ts`
  - `PATCH`: Updates incident status (`ACKNOWLEDGED`, `IN_PROGRESS`, `RESOLVED`) and priority overrides in real-time.

- [x] **4.7. Phase 4 Verification**
  - Verified full UI interactivity, drawer open/close, status updates, and Next.js production build (`next build` 0 errors).

---

## Phase 5: Two-Way Dispatch & Field Coordination

- [x] **5.1. Admin-to-Citizen Reply Channel**
  - **File**: `components/dispatch/ReplyModal.tsx`, `app/api/messages/[id]/reply/route.ts`
  - `POST /api/messages/[id]/reply`: Transmits responses directly to sender nodes and automatically transitions incident status to `IN_PROGRESS`.
  - Canned response dropdown with 5 pre-built tactical templates.

- [x] **5.2. Responder Unit Assignment Modal**
  - **File**: `components/dispatch/AssignResponderModal.tsx`
  - Lists available online rescue boats (e.g. `BOAT-ALPHA`, `BOAT-BRAVO`) with real-time battery and location telemetry for quick assignment.

- [x] **5.3. Responder Coordination Chat Feed**
  - **File**: `components/dispatch/ReplyModal.tsx`
  - Displays conversational reply thread history between Incident Commander and field node.

- [x] **5.4. Broadcast Emergency Alert Modal**
  - **File**: `components/dispatch/BroadcastModal.tsx`, `app/api/messages/broadcast/route.ts`
  - Sends high-priority emergency broadcast across all Kosi flood sectors.

- [x] **5.5. Canned Tactical Templates Manager**
  - **File**: `lib/constants/templates.ts`
  - Pre-defined emergency templates for rescue boat ETA, evacuation to high ground, medical team dispatch, food/water distribution, and boat refueling.

- [x] **5.6. Phase 5 Verification**
  - Verified reply thread dispatch, responder unit assignment, broadcast alert modal, and `npm run typecheck` (0 errors).

---

## Phase 6: Field Activity & Mesh Simulation Engine

- [x] **6.1. Simulator API Engine**
  - **File**: `app/api/simulator/route.ts`
  - `POST /api/simulator`: Handles automated tick clock, moves rescue vessels along Kosi river channel waypoints, adjusts battery %, and updates heartbeats.

- [x] **6.2. Disaster Scenario Presets**
  - **File**: `lib/simulator/scenarios.ts`
  - **Scenario A**: *Flash Flood Surge in Supaul* (generates a live P1 rooftop emergency, creates map node, and executes instant Gemini AI triage).
  - **Scenario B**: *Rescue Boat Low Fuel Alert* (drops boat battery to 14% and triggers a P2 resource request).
  - **Scenario C**: *Reset State to Baseline Seed*.

- [x] **6.3. Floating Simulator Control Bar Component**
  - **File**: `components/simulator/SimulatorControlBar.tsx`
  - Floating widget with Play/Pause live patrol loop, one-click "+ P1 Flood SOS" trigger, "+ P2 Low Fuel" trigger, and Reset button.

- [x] **6.4. Real-Time Telemetry Polling Loop**
  - **File**: `components/dashboard/CommandDashboard.tsx`
  - Automatic background polling (every 4s) ensuring instant map marker motion and message stream updates without page refresh.

- [x] **6.5. Phase 6 Verification**
  - Tested live patrol simulation, P1 emergency generation with automated AI classification, and `npm run typecheck` (0 errors).

---

## Phase 7: Polish, Audio/Visual Alerts & Final QA

- [x] **7.1. Tactical Command Center Visual Theme & Styling**
  - **File**: `app/globals.css`, `theme.md`
  - Strict compliance with `theme.md` and `UI.png`: Warm neutral backgrounds (`stone-50`), crisp white cards with subtle borders (`stone-200`), orange brand accents (`orange-500`), clean typography, and distinct severity tokens (P1 `#dc2626`, P2 `#ea580c`, P3 `#d97706`, P4 `#64748b`).

- [x] **7.2. Audio / Visual Emergency Cues**
  - **Files**: `components/common/EmergencyAudioChime.tsx`, `components/common/EmergencyAlertBanner.tsx`
  - Web Audio API synthesizer chime generating two-tone audio alert when incoming P1 critical emergencies arrive.
  - Flashing red alert banner displaying active P1 counts with one-click "Triage Now" button and audio mute/unmute toggle.

- [x] **7.3. Executive KPI Metrics & Banner Polish**
  - **File**: `components/dashboard/KPICards.tsx`
  - Exact KPI counters matching `UI.png`: 24 Total Messages (`↑ 12%`), 6 Critical P1 (`↑ 2`), 8 Active Responders (`↑ 3`), 37 Connected Devices (`↑ 5`).

- [x] **7.4. Mobile & Tablet Responsive Layout**
  - **File**: `components/dashboard/CommandDashboard.tsx`
  - Responsive Tailwind grid system adapting smoothly from 12-column desktop command layout down to tablet and mobile single-column.

- [x] **7.5. End-to-End Build & Typecheck Validation**
  - Ran `npm run typecheck` (0 errors) and `next build` (11 dynamic/static routes generated with 0 errors).

- [x] **7.6. Final Demo Dry-Run**
  - Verified full live demonstration loop:
    1. Incident Commander views live Kosi satellite flood map with boat patrols moving along the river channel.
    2. Simulated citizen SOS arrives with rooftop flood distress.
    3. Gemini AI classifies message into structured JSON with **P1 Critical** rating, reasoning, and tactical action recommendation.
    4. Commander clicks **Acknowledge**, assigns **Boat Alpha**, and replies with dispatch instructions/ETA.
    5. Incident updates across all mesh nodes and transitions to **Resolved**.

---

## Execution Dependencies & Order

```
[Phase 1: Types & Data Store]
       │
       ▼
[Phase 2: Gemini AI Triage] ────► [Phase 3: Live GIS Map]
       │                                  │
       ▼                                  ▼
[Phase 4: Triage Feed & Drawer] ──► [Phase 5: Two-Way Dispatch]
       │                                  │
       └────────────────┬─────────────────┘
                        ▼
            [Phase 6: Mesh Simulator]
                        │
                        ▼
            [Phase 7: Polish & Demo QA]
```
