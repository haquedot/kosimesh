> **Production Cloud URL**: `https://kosimesh.vercel.app`  
> **Local Mesh Gateway URL**: `http://<gateway-ip>:3000`  
> **Required Headers**:
> - `Content-Type: application/json`
> - `x-mesh-api-key: km_live_mesh_secret_2026` *(or `Authorization: Bearer km_live_mesh_secret_2026`)*  
> **Target Audience**: Mobile Application Developers (Citizen App & Responder App), Embedded GPS/Telemetry Firmware Engineers, Mesh Node Clients, Drone & IoT Gateway Integrators.

---

## Architecture & Communication Flow

```text
┌─────────────────────────┐                                ┌─────────────────────────┐
│   LOCAL FIELD DEVICE    │                                │     KOSI MESH ADMIN     │
│   (Citizen / Responder) │                                │  https://kosimesh.vercel.app │
└────────────┬────────────┘                                └────────────┬────────────┘
             │                                                          │
             │ 1. Initial Device Registration                           │
             ├───────────────── POST /api/devices/register ────────────►│
             │◄──────────────── 201 Created (Device Record) ────────────┤
             │                                                          │
             │ 2. Periodic GPS & Battery Heartbeat (Every 15-60s)       │
             ├───────────────── POST /api/devices/heartbeat ───────────►│
             │◄──────────────── 200 OK (Telemetry Updated) ─────────────┤
             │                                                          │
             │ 3. Send Emergency SOS or Situation Report                │
             ├───────────────── POST /api/messages ────────────────────►│
             │                                                          │ [Auto-Triggers]
             │                                                          │ 🤖 Gemini AI Triage
             │◄──────────────── 201 Created (Message + AI Severity) ────┤
             │                                                          │
             │ 4. Poll / Check Replies & Dispatch Updates               │
             ├───────────────── GET /api/messages/:id ─────────────────►│
             │◄──────────────── 200 OK (Thread Replies & Unit ETA) ─────┤
             │                                                          │
             │ 5. Two-Way Reply from Device to Command Center           │
             ├───────────────── POST /api/messages/:id/reply ──────────►│
             │◄──────────────── 201 Created (Thread Updated) ───────────┤
```

---

## 1. Device Registration & Telemetry

### 1.1. Register Device
Call this when the mobile application starts up or registers a new hardware/phone node on the mesh.

- **URL**: `https://kosimesh.vercel.app/api/devices/register`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

#### Request Payload
```json
{
  "deviceId": "NODE-001",
  "userName": "Alex Mercer",
  "role": "USER",
  "deviceType": "PHONE",
  "latitude": 26.1201,
  "longitude": 86.5902,
  "battery": 78,
  "status": "ONLINE",
  "locationName": "Sector Alpha"
}
```

#### Field Schema
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `deviceId` | string | **Yes** | Unique hardware/node identifier (e.g. `NODE-001`, `BOAT-ALPHA`) |
| `userName` | string | No | User or responder display name (defaults to `deviceId`) |
| `role` | string | No | `"USER"` \| `"RESPONDER"` \| `"ADMIN"` (defaults to `"USER"`) |
| `deviceType` | string | No | `"PHONE"` \| `"BOAT_GPS"` \| `"BASE_STATION"` \| `"DRONE"` |
| `latitude` | number | No | Initial GPS latitude |
| `longitude` | number | No | Initial GPS longitude |
| `battery` | number | No | Battery percentage (0-100) |
| `status` | string | No | `"ONLINE"` \| `"OFFLINE"` \| `"WARNING"` \| `"SOS"` |
| `locationName`| string | No | Named sector / village / operational zone |

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "device": {
    "id": "dev-1727334000000",
    "deviceId": "NODE-001",
    "userId": "usr-1727334000000",
    "userName": "Alex Mercer",
    "role": "USER",
    "deviceType": "PHONE",
    "latitude": 26.1201,
    "longitude": 86.5902,
    "battery": 78,
    "status": "ONLINE",
    "locationName": "Sector Alpha",
    "lastSeen": "2026-09-26T12:30:10.000Z",
    "createdAt": "2026-09-26T12:30:10.000Z",
    "updatedAt": "2026-09-26T12:30:10.000Z"
  }
}
```

---

### 1.2. Ingest Device Heartbeat (GPS & Battery Sync)
Call periodically (e.g. every 15–30 seconds) to update node location, battery percentage, and connectivity state.

- **URL**: `https://kosimesh.vercel.app/api/devices/heartbeat`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

#### Request Payload
```json
{
  "deviceId": "NODE-001",
  "latitude": 26.1205,
  "longitude": 86.5908,
  "battery": 76,
  "status": "ONLINE"
}
```

#### Field Schema
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `deviceId` | string | **Yes** | Device identifier |
| `latitude` | number | No | Updated GPS latitude |
| `longitude` | number | No | Updated GPS longitude |
| `battery` | number | No | Current battery percentage (0-100) |
| `status` | string | No | `"ONLINE"` \| `"WARNING"` \| `"SOS"` \| `"OFFLINE"` |

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "device": {
    "id": "dev-001",
    "deviceId": "NODE-001",
    "latitude": 26.1205,
    "longitude": 86.5908,
    "battery": 76,
    "status": "ONLINE",
    "lastSeen": "2026-09-26T12:35:00.000Z",
    "updatedAt": "2026-09-26T12:35:00.000Z"
  }
}
```

---

### 1.3. Query Connected Devices List
Used by field tablets or mobile coordinators to view nearby online responders and mesh nodes.

- **URL**: `https://kosimesh.vercel.app/api/devices`
- **Method**: `GET`
- **Query Filters**: `?role=RESPONDER&status=ONLINE&search=Alpha`

#### Expected Response (`200 OK`)
```json
{
  "devices": [
    {
      "id": "dev-002",
      "deviceId": "NODE-002",
      "userName": "Rescue Squad Alpha",
      "role": "RESPONDER",
      "deviceType": "BOAT_GPS",
      "latitude": 26.1305,
      "longitude": 86.6103,
      "battery": 65,
      "status": "ONLINE",
      "locationName": "Sector Bravo",
      "lastSeen": "2026-09-26T12:34:00.000Z"
    }
  ],
  "total": 1
}
```

---

## 2. Emergency Messaging & AI Triage

### 2.1. Send Emergency SOS or Situation Report
Transmits distress calls, casualty reports, or hazard sightings. The server **automatically runs Gemini 2.5 Flash AI Triage** upon receipt to compute severity (P1–P4), casualties, vulnerabilities, urgency, and recommended tactical response.

- **URL**: `https://kosimesh.vercel.app/api/messages`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

#### Request Payload
```json
{
  "senderId": "NODE-001",
  "senderName": "Alex Mercer",
  "senderRole": "USER",
  "message": "Water has entered our 1st floor and 5 people are trapped on the roof with elderly. Need rescue boat urgently.",
  "messageType": "SOS",
  "latitude": 26.1201,
  "longitude": 86.5902,
  "locationName": "Sector Alpha"
}
```

#### Field Schema
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `senderId` | string | **Yes** | Sender's `deviceId` or unique identifier |
| `message` | string | **Yes** | Emergency message text |
| `senderName` | string | No | Display name of person/squad reporting |
| `senderRole` | string | No | `"USER"` \| `"RESPONDER"` \| `"ADMIN"` (defaults to `"USER"`) |
| `messageType`| string | No | `"SOS"` \| `"REPORT"` \| `"RESOURCE_REQ"` (defaults to `"SOS"`) |
| `latitude` | number | No | Incident GPS latitude |
| `longitude` | number | No | Incident GPS longitude |
| `locationName`| string | No | Named sector / operational zone |

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "message": {
    "id": "MSG-1025",
    "senderId": "NODE-001",
    "senderName": "Alex Mercer",
    "senderRole": "USER",
    "message": "Water has entered our 1st floor and 5 people are trapped on the roof with elderly. Need rescue boat urgently.",
    "messageType": "SOS",
    "latitude": 26.1201,
    "longitude": 86.5902,
    "locationName": "Sector Alpha",
    "severity": "P1",
    "severityReason": "Multiple people trapped on rooftop with elderly due to active flooding with rapid water rise.",
    "status": "UNREAD",
    "isNew": true,
    "geminiAnalysis": {
      "severity": "P1",
      "severityLabel": "CRITICAL",
      "confidence": 0.96,
      "reason": "Direct life risk: 5 individuals including elderly trapped on rooftop with rising waters.",
      "casualties": 5,
      "vulnerabilities": [
        "trapped_on_roof",
        "rising_water",
        "elderly"
      ],
      "urgency": "IMMEDIATE",
      "recommendedAction": "Dispatch Rescue Vessel Alpha immediately to Sector Alpha coordinates for rooftop extraction.",
      "analyzedAt": "2026-09-26T12:36:00.000Z"
    },
    "createdAt": "2026-09-26T12:36:00.000Z",
    "updatedAt": "2026-09-26T12:36:00.000Z"
  }
}
```

---

### 2.2. Query Messages Inbox & Search
Query messages with optional multi-attribute filters.

- **URL**: `https://kosimesh.vercel.app/api/messages`
- **Method**: `GET`
- **Query Parameters**:
  - `?severity=P1` (`P1`, `P2`, `P3`, `P4`)
  - `?status=UNREAD` (`UNREAD`, `ACKNOWLEDGED`, `IN_PROGRESS`, `RESOLVED`)
  - `?role=USER` (`USER`, `RESPONDER`)
  - `?search=roof` (free-text search)

#### Expected Response (`200 OK`)
```json
{
  "messages": [
    {
      "id": "MSG-1025",
      "senderId": "NODE-001",
      "senderName": "Alex Mercer",
      "senderRole": "USER",
      "message": "Water has entered our 1st floor and 5 people are trapped on the roof with elderly. Need rescue boat urgently.",
      "severity": "P1",
      "status": "UNREAD",
      "locationName": "Sector Alpha",
      "latitude": 26.1201,
      "longitude": 86.5902,
      "createdAt": "2026-09-26T12:36:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 2.3. Fetch Single Message & Conversation Thread
Used by the local device to poll for Incident Command replies, responder assignment, or arrival ETA.

- **URL**: `https://kosimesh.vercel.app/api/messages/:id`
- **Method**: `GET`
- **Example**: `https://kosimesh.vercel.app/api/messages/MSG-1001`

#### Expected Response (`200 OK`)
```json
{
  "message": {
    "id": "MSG-1001",
    "senderId": "NODE-001",
    "senderName": "Alex Mercer",
    "senderRole": "USER",
    "message": "Water has entered our house and 5 people are trapped on the roof.",
    "locationName": "Sector Alpha",
    "severity": "P1",
    "status": "IN_PROGRESS",
    "assignedResponderId": "NODE-002",
    "assignedResponderName": "Rescue Squad Alpha",
    "replies": [
      {
        "id": "rep-1727334500000",
        "senderId": "ADMIN",
        "senderName": "Incident Command Post",
        "senderRole": "ADMIN",
        "message": "Rescue Squad Alpha has been dispatched to your coordinates. Estimated arrival in 10-15 minutes. Stay on the highest point.",
        "createdAt": "2026-09-26T12:38:00.000Z"
      }
    ],
    "createdAt": "2026-09-26T12:28:00.000Z",
    "updatedAt": "2026-09-26T12:38:00.000Z"
  }
}
```

---

### 2.4. Send Two-Way Reply in Message Thread
Used by the citizen or responder to reply back to Command Center messages.

- **URL**: `https://kosimesh.vercel.app/api/messages/:id/reply`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Example**: `https://kosimesh.vercel.app/api/messages/MSG-1001/reply`

#### Request Payload
```json
{
  "senderId": "NODE-001",
  "senderName": "Alex Mercer",
  "senderRole": "USER",
  "message": "We can see Rescue Squad Alpha approaching our street now. Waving white cloth."
}
```

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "message": {
    "id": "MSG-1001",
    "status": "IN_PROGRESS",
    "replies": [
      {
        "id": "rep-1727334500000",
        "senderId": "ADMIN",
        "senderName": "Incident Command Post",
        "senderRole": "ADMIN",
        "message": "Rescue Squad Alpha has been dispatched...",
        "createdAt": "2026-09-26T12:38:00.000Z"
      },
      {
        "id": "rep-1727334650000",
        "senderId": "NODE-001",
        "senderName": "Alex Mercer",
        "senderRole": "USER",
        "message": "We can see Rescue Squad Alpha approaching our street now. Waving white cloth.",
        "createdAt": "2026-09-26T12:40:50.000Z"
      }
    ],
    "updatedAt": "2026-09-26T12:40:50.000Z"
  }
}
```

---

### 2.5. Update Incident Status & Assign Responder
Used by field rescue squads to acknowledge, advance, or resolve an emergency case.

- **URL**: `https://kosimesh.vercel.app/api/messages/:id/status`
- **Method**: `PATCH`
- **Headers**: `Content-Type: application/json`
- **Example**: `https://kosimesh.vercel.app/api/messages/MSG-1001/status`

#### Request Payload
```json
{
  "status": "IN_PROGRESS",
  "assignedResponderId": "NODE-002",
  "assignedResponderName": "Rescue Squad Alpha"
}
```

#### Field Schema
| Parameter | Type | Allowed Values |
| :--- | :--- | :--- |
| `status` | string | `"UNREAD"` \| `"ACKNOWLEDGED"` \| `"IN_PROGRESS"` \| `"RESOLVED"` |
| `assignedResponderId` | string | Optional responder device ID |
| `assignedResponderName` | string | Optional responder display name |
| `severity` | string | Optional manual severity override (`"P1"`, `"P2"`, `"P3"`, `"P4"`) |

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": {
    "id": "MSG-1001",
    "status": "IN_PROGRESS",
    "assignedResponderId": "NODE-002",
    "assignedResponderName": "Rescue Squad Alpha",
    "updatedAt": "2026-09-26T12:45:00.000Z"
  }
}
```

---

### 2.6. Mesh Emergency Broadcast
Pushes a high-priority alert to all connected mobile nodes and field radios.

- **URL**: `https://kosimesh.vercel.app/api/messages/broadcast`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

#### Request Payload
```json
{
  "message": "FLASH FLOOD EVACUATION: Water discharge surging upstream. All citizens in low sectors must move immediately to high ground shelters.",
  "severity": "P1",
  "locationName": "All Operational Sectors"
}
```

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "message": {
    "id": "MSG-1030",
    "senderId": "ADMIN-BROADCAST",
    "senderName": "Incident Command Post (EOC)",
    "senderRole": "ADMIN",
    "message": "FLASH FLOOD EVACUATION: Water discharge surging upstream. All citizens in low sectors must move immediately to high ground shelters.",
    "messageType": "DISPATCH",
    "severity": "P1",
    "status": "UNREAD",
    "createdAt": "2026-09-26T12:50:00.000Z"
  }
}
```

---

### 2.7. On-Demand Gemini AI Triage Endpoint
Allows mobile apps or edge gateways to pre-evaluate message severity and tactical instructions before transmitting.

- **URL**: `https://kosimesh.vercel.app/api/gemini/triage`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

#### Request Payload
```json
{
  "message": "River embankment breached! Water rushing rapidly into settlement. 12 people trapped.",
  "senderName": "Field Unit Bravo",
  "senderRole": "RESPONDER",
  "locationName": "Sector Charlie"
}
```

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "analysis": {
    "severity": "P1",
    "severityLabel": "CRITICAL",
    "confidence": 0.98,
    "reason": "Active embankment breach with fast-moving floodwaters trapping 12 individuals.",
    "casualties": 12,
    "vulnerabilities": ["embankment_breach", "rapid_inundation", "trapped_settlement"],
    "urgency": "IMMEDIATE",
    "recommendedAction": "Trigger emergency siren in Sector Charlie and deploy amphibious evacuation teams.",
    "analyzedAt": "2026-09-26T12:52:00.000Z"
  }
}
```

---

## 3. System Metrics & Simulation

### 3.1. Fetch Real-Time Dashboard KPI Metrics
- **URL**: `https://kosimesh.vercel.app/api/metrics`
- **Method**: `GET`

#### Expected Response (`200 OK`)
```json
{
  "metrics": {
    "totalMessages": 1284,
    "totalMessagesChangePct": 12,
    "criticalP1Count": 4,
    "criticalP1Change": 3,
    "activeResponders": 18,
    "activeRespondersChange": 2,
    "connectedDevices": 42,
    "connectedDevicesChange": 5,
    "severityCounts": {
      "P1": 4,
      "P2": 7,
      "P3": 12,
      "P4": 2
    },
    "updatedAt": "2026-09-26T12:55:00.000Z"
  }
}
```

---

## 4. Error Codes & Structure

| HTTP Status | Error Response Body | Cause & Action |
| :--- | :--- | :--- |
| `400 Bad Request` | `{"error": "deviceId is required"}` | Missing mandatory fields in request payload |
| `404 Not Found` | `{"error": "Message not found"}` | Target `id` does not exist in store/database |
| `500 Internal Error` | `{"error": "<error message>"}` | Server-side execution or database failure |
