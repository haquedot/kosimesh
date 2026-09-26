# Kosi Mesh Admin — Implementation Plan & Technical Specification

> **Project**: Kosi Mesh Admin (Disaster & Flood Emergency Coordination Platform)  
> **Target Region / Context**: Kosi River Basin, Bihar (Flood triage, local-first mesh communication & AI-assisted dispatch)  
> **Document Status**: Approved / Active  
> **Source Reference**: [`docs/SRS.md`](file:///e:/Deepmind%20Hackathon/kosi-mesh-admin/docs/SRS.md)

---

## 1. Executive Summary & Goals

The **Kosi Mesh Admin** is an emergency command and coordination dashboard designed to monitor field mesh nodes (responders, rescue boats, affected citizens), ingest incoming distress reports, automatically analyze emergency severity using **Gemini AI**, and empower incident commanders to coordinate rescue operations in real-time.

### Primary Objectives
1. **Live Mesh Telemetry**: Real-time tracking of GPS coordinates, battery levels, connectivity status, and node roles across the Kosi disaster zone.
2. **Gemini AI Severity Classification**: Automatic structured triage of incoming citizen and responder messages into **P1 (Critical)**, **P2 (High)**, **P3 (Moderate)**, and **P4 (Low)** with clear reasoning and recommended operational actions.
3. **Emergency Command & Dispatch**: Two-way communication channel between the Admin Command Center, Field Responders (e.g. Boat Alpha, Rescue Squads), and Trapped Citizens.
4. **Resilient Local-First Architecture**: Operational capability to sync asynchronously with field mesh networks when intermittent connectivity is restored.

---

## 2. System Architecture

```text
                                  ┌───────────────────────────────┐
                                  │      FIELD MESH / USERS       │
                                  │  • Affected Citizens (SOS)    │
                                  │  • Rescue Boats (GPS/Status)  │
                                  │  • Field Volunteers (Reports) │
                                  └───────────────┬───────────────┘
                                                  │ HTTP / REST / SSE
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 NEXT.JS APP ROUTER BACKEND                                  │
│                                                                                             │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌──────────────────────────────┐   │
│  │   /api/devices         │  │   /api/messages        │  │   /api/gemini/triage         │   │
│  │   • Device Register    │  │   • Ingest SOS Reports │  │   • Structured JSON Output   │   │
│  │   • Heartbeat & GPS    │  │   • Status Lifecycle   │  │   • P1-P4 Severity Reasoning │   │
│  │   • Telemetry Query    │  │   • Two-Way Replies    │  │   • Urgency & Casualty Extr. │   │
│  └───────────┬────────────┘  └───────────┬────────────┘  └──────────────┬───────────────┘   │
│              │                           │                              │                   │
│              └───────────────────────────┼──────────────────────────────┘                   │
│                                          ▼                                                  │
│                        ┌───────────────────────────────────┐                                │
│                        │      PERSISTENT DATA STORE        │                                │
│                        │   (SQLite / File-backed Engine)   │                                │
│                        │   • Devices • Messages • Users    │                                │
│                        └───────────────────────────────────┘                                │
└──────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  ADMIN DASHBOARD (FRONTEND)                                 │
│                                                                                             │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌──────────────────────────────┐   │
│  │   GIS Live Map         │  │   Triage & Inbox       │  │   Command & Dispatch         │   │
│  │   • Interactive Nodes  │  │   • Priority Filters   │  │   • Responder Two-way Chat   │   │
│  │   • SOS Beacon Alerts  │  │   • Gemini AI Insights │  │   • Quick Actions & Broadcast│   │
│  │   • Sector Heatmaps    │  │   • Human Confirmation │  │   • Field Simulator Tool     │   │
│  └────────────────────────┘  └────────────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Models & Schemas

### 3.1. `ConnectedDevice`
Represents an active hardware or mobile node connected directly or via mesh relay.

```typescript
export type DeviceRole = 'RESPONDER' | 'USER' | 'ADMIN';
export type DeviceType = 'PHONE' | 'BOAT_GPS' | 'BASE_STATION' | 'DRONE';
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'WARNING' | 'SOS';

export interface ConnectedDevice {
  id: string;              // Internal UUID
  deviceId: string;        // Hardware/Node Tag (e.g., "NODE-001", "BOAT-ALPHA")
  userId?: string;         // Associated user ID
  userName?: string;       // User/Responder display name
  role: DeviceRole;        // Role of node
  deviceType: DeviceType;  // Hardware category
  latitude: number;        // Current GPS Latitude
  longitude: number;       // Current GPS Longitude
  battery: number;         // 0 - 100 percentage
  status: DeviceStatus;    // Operating condition
  sector?: string;         // Sector name (e.g. "Supaul Sector 2B")
  lastSeen: string;        // ISO 8601 Timestamp
  createdAt: string;       // ISO 8601 Timestamp
  updatedAt: string;       // ISO 8601 Timestamp
}
```

### 3.2. `Message` & `GeminiAnalysis`
Represents any incoming emergency distress call, situation report, or outgoing dispatch instruction.

```typescript
export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export type MessageType = 'SOS' | 'REPORT' | 'RESOURCE_REQ' | 'DISPATCH' | 'REPLY';
export type MessageStatus = 'UNREAD' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';

export interface GeminiAnalysisResult {
  severity: PriorityLevel;             // P1 | P2 | P3 | P4
  severityLabel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  confidence: number;                  // 0.00 to 1.00
  reason: string;                      // Detailed reasoning explaining classification
  casualties: number;                  // Estimated number of trapped/affected people
  vulnerabilities: string[];           // e.g. ["children", "elderly", "medical_need", "roof_trapped"]
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;           // Direct operational advice for Incident Commander
}

export interface Message {
  id: string;                          // e.g. "MSG-1001"
  senderId: string;                    // DeviceId or UserId
  senderName?: string;                 // e.g. "Rahul Kumar" / "Boat Alpha"
  receiverId?: string;                 // Target recipient or "ADMIN"
  senderRole: DeviceRole;              // "USER" | "RESPONDER" | "ADMIN"
  message: string;                     // Raw text body
  messageType: MessageType;            // "SOS" | "REPORT" | "RESOURCE_REQ" | ...
  latitude?: number;                   // Incident coordinates
  longitude?: number;                  // Incident coordinates
  locationName?: string;               // e.g. "Supaul Ward 4"
  severity?: PriorityLevel;            // P1-P4
  severityReason?: string;             // Short reason summary
  geminiAnalysis?: GeminiAnalysisResult; // Deep AI output payload
  status: MessageStatus;               // "UNREAD" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED"
  assignedResponderId?: string;        // ID of responder assigned to handle this
  createdAt: string;                   // ISO 8601
  updatedAt: string;                   // ISO 8601
}
```

---

## 4. API Endpoints Specification

| Method | Endpoint | Description | Payload / Query |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/devices/register` | Register or update a mesh node | `{ deviceId, role, deviceType, userName, lat, lng }` |
| `POST` | `/api/devices/heartbeat` | Ingest periodic GPS & battery ping | `{ deviceId, latitude, longitude, battery, status }` |
| `GET` | `/api/devices` | List all active/inactive devices | `?role=RESPONDER&status=ONLINE` |
| `GET` | `/api/devices/[id]` | Get specific device telemetry | `id` parameter |
| `POST` | `/api/messages` | Ingest new SOS / report & run AI | `{ senderId, senderRole, message, latitude, longitude, messageType }` |
| `GET` | `/api/messages` | Retrieve filtered message feed | `?severity=P1&status=UNREAD&role=USER` |
| `GET` | `/api/messages/[id]` | Get single message details & AI analysis | `id` parameter |
| `PATCH` | `/api/messages/[id]/status` | Update incident status | `{ status: "ACKNOWLEDGED" \| "RESOLVED", assignedResponderId? }` |
| `POST` | `/api/messages/[id]/reply` | Send direct dispatch reply to node | `{ replyMessage, senderId: "ADMIN" }` |
| `POST` | `/api/simulator/tick` | Trigger simulated field movements & events | `{ scenario: "FLASH_FLOOD" \| "NORMAL" }` |

---

## 5. Gemini AI Triage Prompt & Response Schema

### 5.1. System Instruction
```text
You are the AI Disaster Triage Officer for the Kosi River Basin Flood Command System.
Your task is to analyze incoming SOS distress calls and field reports, extract key disaster parameters, and classify them into strict incident priority levels:

P1 (CRITICAL): Immediate life-threat, people trapped by rising water, drowning risk, medical emergency, elderly/infants in danger.
P2 (HIGH): Severe property isolation, flood water entering dwelling, urgent food/fuel/medicine shortage within 6-12 hours.
P3 (MODERATE): Rising water level warnings, road blockages, cattle rescue, resource requests for next 24-48 hours.
P4 (LOW): General information, status check-ins, routine weather reports.

Always return a valid, strictly structured JSON object.
```

### 5.2. Structured Response Schema (Google Gen AI SDK)
```json
{
  "type": "OBJECT",
  "properties": {
    "severity": { "type": "STRING", "enum": ["P1", "P2", "P3", "P4"] },
    "severityLabel": { "type": "STRING", "enum": ["CRITICAL", "HIGH", "MODERATE", "LOW"] },
    "confidence": { "type": "NUMBER" },
    "reason": { "type": "STRING" },
    "casualties": { "type": "INTEGER" },
    "vulnerabilities": {
      "type": "ARRAY",
      "items": { "type": "STRING" }
    },
    "urgency": { "type": "STRING", "enum": ["IMMEDIATE", "HIGH", "MEDIUM", "LOW"] },
    "recommendedAction": { "type": "STRING" }
  },
  "required": ["severity", "severityLabel", "confidence", "reason", "casualties", "vulnerabilities", "urgency", "recommendedAction"]
}
```

---

## 6. Implementation Phases

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Core Foundation & Data Layer                                           │
│   • Data store implementation & persistent state                                │
│   • API endpoints for Device heartbeat, registration & Message ingestion        │
│   • Seed data with realistic Kosi flood coordinates (Supaul, Saharsa, Madhepura)│
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Gemini AI Triage Engine                                                │
│   • Gemini API integration with structured JSON schema                          │
│   • Asynchronous analysis pipeline with fallback rule heuristics                │
│   • Triage evaluation & extraction of casualties, urgency & actions             │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Live GIS Map & Mesh Telemetry HUD                                      │
│   • Interactive Map component with tactical dark theme                          │
│   • Dynamic markers for Responders (Boats/Teams) & Citizen SOS beacons          │
│   • Real-time node inspection cards (Battery, Signal, Coordinates, Last Seen)  │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: Emergency Triage Dashboard & AI Insights Panel                         │
│   • Severity-tiered inbox (P1 Critical, P2 High, P3 Moderate, P4 Low)           │
│   • Dedicated AI Assessment drawer showing Gemini reasoning & suggested actions │
│   • Human-in-the-loop acknowledgement, triage override & status workflows       │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: Two-Way Dispatch & Coordination System                                 │
│   • Admin-to-Citizen reply channel with canned emergency instructions           │
│   • Responder dispatching & task assignment mechanism                           │
│   • Broadcast emergency alert banner for sector-wide notifications              │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: Field Activity & Mesh Simulator Engine                                 │
│   • Real-time simulator generating boat patrols, battery drop & new SOS pings   │
│   • One-click disaster scenario presets for live hackathon demonstration        │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 7: Design Polish, Emergency Audio/Visual Cues & Metrics                   │
│   • High-impact command center UI with subtle pulse animations for P1 alerts    │
│   • Top executive metrics bar (Active Nodes, Unresolved P1s, Deployed Responders)│
│   • Performance, mobile responsiveness, and end-to-end verification             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### Detailed Phase Breakdown

### **Phase 1: Core Foundation & Data Layer**
- [ ] Create `lib/types/schema.ts` for all entities (`Device`, `Message`, `User`, `GeminiAnalysis`).
- [ ] Implement file-persisted JSON/SQLite store `lib/db/store.ts` with atomic updates and seeding.
- [ ] Implement REST endpoints:
  - `POST /api/devices/register`
  - `POST /api/devices/heartbeat`
  - `GET /api/devices`
  - `POST /api/messages`
  - `GET /api/messages`
- [ ] Populate initial seed data with 6 field nodes (Rescue Boat Alpha, Sector 2 Patrol, Base Station, 3 Citizen Nodes) in Kosi flood zones.

### **Phase 2: Gemini AI Triage Engine**
- [ ] Implement `lib/gemini/triage.ts` using Google Gemini SDK (`@google/genai` or Gemini 2.5 Flash).
- [ ] Implement structured schema enforcement returning P1-P4, casualty estimates, urgency, and recommended actions.
- [ ] Wire automatic triage inside `POST /api/messages` to immediately analyze incoming distress calls upon receipt.
- [ ] Implement resilient fallback rule classifier in case of API rate limits.

### **Phase 3: Live GIS Map & Mesh Telemetry HUD**
- [ ] Setup interactive Leaflet / MapLibre map component centered on the Kosi river basin (`26.12°N, 86.59°E`).
- [ ] Add custom tactical map markers:
  - 🚤 Responders: Blue/Green with boat/medical icon and battery status.
  - 🚨 SOS Users: Red pulsing beacons for P1/P2 active incidents.
  - 📡 Base Stations: Purple radar towers.
- [ ] Implement node selection HUD popup displaying live battery %, signal status, role, and quick actions.

### **Phase 4: Emergency Triage Dashboard & AI Insights Panel**
- [ ] Build triage feed UI with quick-filter pills (`All`, `P1 Critical`, `P2 High`, `P3 Moderate`, `P4 Low`).
- [ ] Build Incident Detail modal / drawer featuring:
  - Original SOS text + sender metadata.
  - Gemini AI Assessment Card: Confidence meter, Casualty tag, Urgency badge, and reasoning.
  - Recommended action banner with one-click approval.
- [ ] Implement Status Transition actions (`Acknowledge`, `Mark In Progress`, `Resolve`).

### **Phase 5: Two-Way Dispatch & Coordination System**
- [ ] Implement `POST /api/messages/[id]/reply` and `PATCH /api/messages/[id]/status`.
- [ ] Create Responder Assignment modal to dispatch specific nearby rescue boats to an incident location.
- [ ] Add Broadcast Emergency Announcement modal to push alerts across the mesh.
- [ ] Add pre-configured quick replies (e.g. *"Rescue team dispatched: ETA 15 mins. Stay on high ground."*).

### **Phase 6: Field Activity & Mesh Simulator Engine**
- [ ] Build `/api/simulator` API endpoint supporting automated tick triggers.
- [ ] Build a floating Simulator Control Bar for the hackathon demo:
  - Toggle automatic node motion along the Kosi river.
  - Trigger instant "Simulate P1 SOS Flood Emergency" button.
  - Toggle simulated battery drain and network dropouts.

### **Phase 7: Design Polish, Audio/Visual Cues & Metrics**
- [ ] Refine visual styling: sleek dark command-center aesthetic, glassmorphism cards, clear typography.
- [ ] Implement audio alert ping (optional toggle) and flashing indicator for incoming P1 critical emergencies.
- [ ] Build top summary analytics banner:
  - *Connected Devices Online*
  - *Active Critical (P1) Incidents*
  - *Responders Deployed*
  - *Average AI Triage Response Time*
- [ ] Final end-to-end testing and build validation.

---

## 7. Deliverables & Acceptance Criteria

| Component | Acceptance Criteria |
| :--- | :--- |
| **Device Map** | All active mesh devices appear on map at accurate Kosi GPS coordinates with distinct role icons and battery health. |
| **Gemini AI Triage** | Ingested SOS messages are parsed into structured JSON with accurate P1–P4 severity rating, reasoning, and suggested action in <2s. |
| **Triage Inbox** | Incident commanders can filter by priority, view Gemini AI reasoning, acknowledge incidents, and change status. |
| **Two-Way Dispatch** | Admin can reply to distress reports, assign rescue units, and dispatch canned emergency advice. |
| **Demo Simulator** | A dedicated simulator controls live node movements and emergency generation for seamless hackathon presentation. |
