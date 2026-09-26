# Kosi Mesh Admin — Master Refactoring & Universal Upgrade Tasks (TODOS)

> **Document Status**: Ready for Execution  
> **Source Plan**: [`docs/AUDIT_AND_IMPROVEMENT_PLAN.md`](file:///e:/Deepmind%20Hackathon/kosi-mesh-admin/docs/AUDIT_AND_IMPROVEMENT_PLAN.md)  
> **Design Theme**: Strict compliance with [`docs/theme.md`](file:///e:/Deepmind%20Hackathon/kosi-mesh-admin/docs/theme.md) and [`docs/UI.png`](file:///e:/Deepmind%20Hackathon/kosi-mesh-admin/docs/UI.png)  
> **Core Objective**: Eliminate all dead clicks, add full multi-view navigation, and make the platform 100% location-agnostic and universally deployable anywhere in the world.

---

## Progress Overview

| Phase | Description | Status | Total Tasks | Completed |
| :--- | :--- | :---: | :---: | :---: |
| **Phase A** | Universal Location-Agnostic Engine & AI Generalization | ⏳ Pending | 5 | 0 |
| **Phase B** | Dedicated Navigation Views (Map, Messages, Devices, Users) | ⏳ Pending | 5 | 0 |
| **Phase C** | Interactive Modals, Popovers & Dead Click Remediation | ⏳ Pending | 6 | 0 |
| **Phase D** | Visual Polish, Build Verification & Full QA | ⏳ Pending | 4 | 0 |
| **Total** | | | **20 Tasks** | **0 / 20** |

---

## Phase A: Universal Location-Agnostic Engine & AI Generalization

- [ ] **A.1. Universal Gemini AI System Prompt & Schema**
  - **File**: `lib/gemini/triage.ts`
  - Refactor system instruction from region-specific text (*"Kosi River Basin in Bihar"*) to **Universal Multi-Hazard Disaster AI Triage Engine** supporting floods, storms, earthquakes, wildfires, medical emergencies, and humanitarian distress anywhere globally.
  - Ensure structured JSON output extracts location dynamically from the report payload.

- [ ] **A.2. Universal Heuristic Fallback Classifier**
  - **File**: `lib/gemini/fallback.ts`
  - Generalize keyword dictionary to cover broader disaster scenarios (earthquake rubble, storm surge, wildfire perimeter, medical distress, cut off without road access).
  - Parameterize all recommended actions dynamically with actual incoming location strings.

- [ ] **A.3. Generalized Emergency Canned Templates**
  - **File**: `lib/constants/templates.ts`
  - Remove hardcoded place names (*"Supaul Primary School"*).
  - Create universally applicable tactical directives (*"Rescue Vessel Dispatched"*, *"Move to High Ground/Safe Zone"*, *"Emergency Medical Squad En Route"*, *"Relief Aid & Water Staging Point"*, *"Refueling & Battery Depot Point"*).

- [ ] **A.4. Dynamic Map Centroid & Auto-Bounding Box**
  - **File**: `components/map/LiveMeshMap.tsx`
  - Replace fixed hardcoded `[26.13, 86.60]` center with dynamic centroid calculation.
  - Implement Leaflet `fitBounds` so the map dynamically frames any geographic location where devices or incident markers are present anywhere in the world.
  - Remove hardcoded static DOM watermarks (`"Madhubani"`, `"Supaul"`, `"Saharsa"`, `"Madhepura"`, `"Kosi River"`) and replace with dynamic sector badges derived from active data.

- [ ] **A.5. Location-Agnostic Backend Fallbacks & Configuration**
  - **Files**: `lib/db/store.ts`, `app/api/devices/register/route.ts`, `app/api/messages/route.ts`, `app/api/messages/broadcast/route.ts`
  - Replace hardcoded `'Supaul Sector'` defaults with configurable generic fallback (`'Operational Sector Alpha'`).

---

## Phase B: Dedicated Navigation Views & View Switcher

- [ ] **B.1. Navigation View Switcher Engine**
  - **File**: `components/dashboard/CommandDashboard.tsx`
  - Wire `activeNav` state (`'dashboard'`, `'map'`, `'messages'`, `'devices'`, `'users'`) to dynamically render the corresponding dedicated view.

- [ ] **B.2. Full-Screen Tactical Map View**
  - **File**: `components/views/FullMapView.tsx`
  - Expand map to full-screen command interface with collapsible live telemetry sidebar, live incident radar, and real-time device counters.

- [ ] **B.3. Dedicated Messages & Triage Console View**
  - **File**: `components/views/FullMessagesView.tsx`
  - Full-page triage inbox with search bar, priority filters (`All`, `P1`, `P2`, `P3`, `P4`), status filters (`Unread`, `Acknowledged`, `In Progress`, `Resolved`), role filters, and quick triage drawer trigger.

- [ ] **B.4. Dedicated Fleet & Devices Management View**
  - **File**: `components/views/FullDevicesView.tsx`
  - Full fleet table with live search, role filter (`Responders`, `Users`), status filter (`Online`, `Offline`), battery sorting, ping tool, and row click telemetry inspector.

- [ ] **B.5. Dedicated Users & Personnel Roster View**
  - **File**: `components/views/FullUsersView.tsx`
  - Overview of deployed responder teams, rescue squad leaders, field volunteers, and registered citizens with device association and quick dispatch actions.

---

## Phase C: Interactive Modals, Popovers & Dead Click Remediation

- [ ] **C.1. Device Telemetry & Detail Modal**
  - **File**: `components/devices/DeviceDetailModal.tsx`
  - Implement full modal opened when clicking any device row in `ConnectedDevicesTable` or clicking any device marker on the map.
  - Displays: Device ID, User/Responder Name, Role badge, Battery meter with health status, GPS Coordinates, Last seen timestamp, and quick action button to send a direct message.

- [ ] **C.2. Emergency Notification Slide-Over / Popover**
  - **File**: `components/dashboard/NotificationDrawer.tsx`
  - Openable via Header Notification Bell icon.
  - Displays list of all unread alerts, emergency broadcasts, and high-priority distress signals with one-click triage inspection.

- [ ] **C.3. Admin Command & Diagnostics Dropdown**
  - **File**: `components/dashboard/AdminDropdown.tsx`
  - Openable via Header Admin avatar or Sidebar Admin profile card.
  - Displays: System health status, database connection state (MongoDB/In-Memory), active mesh nodes count, operation zone switcher, and data reset tool.

- [ ] **C.4. Real-Time Map Tile Layer Selector**
  - **File**: `components/map/LiveMeshMap.tsx`
  - Interactive popup on clicking `Layers` button allowing user to switch tile providers in real time:
    - 🛰️ **Satellite Imagery** (Esri World Imagery)
    - 🌑 **Dark Canvas** (CartoDB Dark Matter)
    - 🗺️ **Street / Navigation** (OpenStreetMap)
    - 🏔️ **Topographic Relief** (OpenTopoMap)

- [ ] **C.5. Interactive KPI Card Filter Actions**
  - **File**: `components/dashboard/KPICards.tsx`, `components/dashboard/CommandDashboard.tsx`
  - Clicking **Total Messages** $\rightarrow$ filters to all messages / opens Messages view.
  - Clicking **Critical (P1)** $\rightarrow$ immediately filters recent messages and map to P1 Critical incidents.
  - Clicking **Active Responders** $\rightarrow$ immediately filters map markers and device table to Responders.
  - Clicking **Connected Devices** $\rightarrow$ navigates to Devices management view.

- [ ] **C.6. Wire "View All →" Buttons**
  - **Files**: `components/devices/ConnectedDevicesTable.tsx`, `components/triage/RecentMessagesCard.tsx`
  - Wire "View All →" in Devices card to switch to the full Devices view (`activeNav = 'devices'`).
  - Wire "View All →" in Messages card to switch to the full Messages view (`activeNav = 'messages'`).

---

## Phase D: Visual Polish, Build Verification & Quality Assurance

- [ ] **D.1. Strict Theme & Aesthetics Review**
  - Verify styling across all new views against [`theme.md`](file:///e:/Deepmind%20Hackathon/kosi-mesh-admin/docs/theme.md) and [`UI.png`](file:///e:/Deepmind%20Hackathon/kosi-mesh-admin/docs/UI.png): warm stone background (`stone-50`), rounded cards (`rounded-2xl border-stone-200 shadow-xs`), orange primary accents (`orange-500`), clean typography, and standard severity badges.

- [ ] **D.2. End-to-End Typecheck Validation**
  - Run `npm run typecheck` to guarantee 0 TypeScript errors across all views, components, and API routes.

- [ ] **D.3. Next.js Production Build Validation**
  - Run `npm run build` to verify SSR and client hydration bundle compilation with 0 warnings or errors.

- [ ] **D.4. Interactive Smoke Test & Demo Verification**
  - Test every navigation tab, modal trigger, filter combination, layer switcher, and live patrol simulation loop.
