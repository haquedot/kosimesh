# Kosi Mesh — Local Device API Reference

> **Target Audience**: Mobile Application Developers (Citizen App & Responder App), Embedded GPS/Telemetry Firmware Engineers, Mesh Node Clients  
> **Base URL**: `http://<server-ip>:3000` (or local mesh gateway IP)  
> **Content-Type**: `application/json`

---

## 1. Overview & Flow

```text
┌─────────────────────────┐                                ┌─────────────────────────┐
│   LOCAL FIELD DEVICE    │                                │     KOSI MESH ADMIN     │
│   (Citizen / Responder) │                                │       BACKEND API       │
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

## 2. Endpoints Specification

### 2.1. Register Device
Call this when the mobile application starts up or registers a new hardware/phone node on the mesh.

- **Method**: `POST`
- **Endpoint**: `/api/devices/register`

#### Request Payload
```json
{
  "deviceId": "NODE-001",
  "userName": "Rahul Kumar",
  "role": "USER",
  "deviceType": "PHONE",
  "latitude": 26.1201,
  "longitude": 86.5902,
  "battery": 78,
  "status": "ONLINE",
  "locationName": "Supaul Ward 4"
}
```

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
| `locationName`| string | No | Village / Sector name (e.g. `"Supaul"`, `"Sector 2B"`) |

#### Expected Response (`201 Created`)
```json
{
  "success": true,
  "device": {
    "id": "dev-1727334000000",
    "deviceId": "NODE-001",
    "userId": "usr-1727334000000",
    "userName": "Rahul Kumar",
    "role": "USER",
    "deviceType": "PHONE",
    "latitude": 26.1201,
    "longitude": 86.5902,
    "battery": 78,
    "status": "ONLINE",
    "locationName": "Supaul Ward 4",
    "lastSeen": "2026-09-26T12:30:10.000Z",
    "createdAt": "2026-09-26T12:30:10.000Z",
    "updatedAt": "2026-09-26T12:30:10.000Z"
  }
}
```

---

### 2.2. Ingest Device Heartbeat (GPS & Battery Sync)
Call periodically (e.g. every 15–30 seconds) to update node location, power state, and connectivity status.

- **Method**: `POST`
- **Endpoint**: `/api/devices/heartbeat`

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

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `deviceId` | string | **Yes** | Device identifier |
| `latitude` | number | No | Updated latitude |
| `longitude` | number | No | Updated longitude |
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

### 2.3. Send Emergency SOS or Situation Report
Used by affected citizens or responders to transmit emergency distress calls or flood observations. The server **automatically runs Gemini AI Severity Triage** upon receipt.

- **Method**: `POST`
- **Endpoint**: `/api/messages`

#### Request Payload
```json
{
  "senderId": "NODE-001",
  "senderName": "Rahul Kumar",
  "senderRole": "USER",
  "message": "Water has entered our 1st floor and 5 people are trapped on the roof. Need rescue boat urgently.",
  "messageType": "SOS",
  "latitude": 26.1201,
  "longitude": 86.5902,
  "locationName": "Supaul Ward 4"
}
```

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `senderId` | string | **Yes** | Sender's `deviceId` or `userId` |
| `message` | string | **Yes** | Distress or situation report text |
| `senderName` | string | No | Display name of person/vessel reporting |
| `senderRole` | string | No | `"USER"` \| `"RESPONDER"` \| `"ADMIN"` (defaults to `"USER"`) |
| `messageType`| string | No | `"SOS"` \| `"REPORT"` \| `"RESOURCE_REQ"` (defaults to `"SOS"`) |
| `latitude` | number | No | Incident GPS coordinates |
| `longitude` | number | No | Incident GPS coordinates |
| `locationName`| string | No | Named sector / village |

#### Expected Response (`201 Created`)
*Note: Returns structured Gemini AI assessment automatically!*
```json
{
  "success": true,
  "message": {
    "id": "MSG-1025",
    "senderId": "NODE-001",
    "senderName": "Rahul Kumar",
    "senderRole": "USER",
    "message": "Water has entered our 1st floor and 5 people are trapped on the roof. Need rescue boat urgently.",
    "messageType": "SOS",
    "latitude": 26.1201,
    "longitude": 86.5902,
    "locationName": "Supaul Ward 4",
    "severity": "P1",
    "severityReason": "Multiple people trapped on rooftop due to active flooding with rapid water rise.",
    "status": "UNREAD",
    "isNew": true,
    "geminiAnalysis": {
      "severity": "P1",
      "severityLabel": "CRITICAL",
      "confidence": 0.96,
      "reason": "Direct life risk: 5 individuals trapped on rooftop with rising floodwaters.",
      "casualties": 5,
      "vulnerabilities": [
        "trapped_on_roof",
        "rising_water",
        "elderly_children"
      ],
      "urgency": "IMMEDIATE",
      "recommendedAction": "Dispatch Rescue Boat Alpha immediately to Supaul Ward 4 for rooftop extraction.",
      "analyzedAt": "2026-09-26T12:36:00.000Z"
    },
    "createdAt": "2026-09-26T12:36:00.000Z",
    "updatedAt": "2026-09-26T12:36:00.000Z"
  }
}
```

---

### 2.4. Fetch Incident Details & Dispatch Updates
Used by the local device to check if Incident Command has acknowledged the SOS, assigned a rescue boat, or sent reply instructions.

- **Method**: `GET`
- **Endpoint**: `/api/messages/:id`
- **Example**: `/api/messages/MSG-1001`

#### Expected Response (`200 OK`)
```json
{
  "message": {
    "id": "MSG-1001",
    "senderId": "NODE-001",
    "senderName": "Rahul Kumar",
    "senderRole": "USER",
    "message": "Water has entered our house and 5 people are trapped on the roof.",
    "locationName": "Supaul",
    "severity": "P1",
    "status": "IN_PROGRESS",
    "assignedResponderId": "NODE-002",
    "assignedResponderName": "Boat Alpha",
    "replies": [
      {
        "id": "rep-1727334500000",
        "senderId": "ADMIN",
        "senderName": "Admin Command Center",
        "senderRole": "ADMIN",
        "message": "Rescue Boat Alpha has been dispatched to your coordinates. Estimated arrival in 10-15 minutes. Stay on the highest point.",
        "createdAt": "2026-09-26T12:38:00.000Z"
      }
    ],
    "createdAt": "2026-09-26T12:28:00.000Z",
    "updatedAt": "2026-09-26T12:38:00.000Z"
  }
}
```

---

### 2.5. Send Two-Way Reply / Status Update to Command Center
Used by the citizen or responder to reply back to Command Center messages.

- **Method**: `POST`
- **Endpoint**: `/api/messages/:id/reply`
- **Example**: `/api/messages/MSG-1001/reply`

#### Request Payload
```json
{
  "senderId": "NODE-001",
  "senderName": "Rahul Kumar",
  "senderRole": "USER",
  "message": "We can see Boat Alpha approaching our street now. Waving white cloth."
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
        "senderName": "Admin Command Center",
        "senderRole": "ADMIN",
        "message": "Rescue Boat Alpha has been dispatched...",
        "createdAt": "2026-09-26T12:38:00.000Z"
      },
      {
        "id": "rep-1727334650000",
        "senderId": "NODE-001",
        "senderName": "Rahul Kumar",
        "senderRole": "USER",
        "message": "We can see Boat Alpha approaching our street now. Waving white cloth.",
        "createdAt": "2026-09-26T12:40:50.000Z"
      }
    ],
    "updatedAt": "2026-09-26T12:40:50.000Z"
  }
}
```

---

### 2.6. Update Incident Status (Responders & Admins)
Used by field rescue squads to mark an operation *Acknowledged*, *In Progress*, or *Resolved*.

- **Method**: `PATCH`
- **Endpoint**: `/api/messages/:id/status`
- **Example**: `/api/messages/MSG-1001/status`

#### Request Payload
```json
{
  "status": "RESOLVED"
}
```

| Parameter | Type | Allowed Values |
| :--- | :--- | :--- |
| `status` | string | `"UNREAD"` \| `"ACKNOWLEDGED"` \| `"IN_PROGRESS"` \| `"RESOLVED"` |
| `severity` | string | `"P1"` \| `"P2"` \| `"P3"` \| `"P4"` (optional manual override) |

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "message": {
    "id": "MSG-1001",
    "status": "RESOLVED",
    "updatedAt": "2026-09-26T12:45:00.000Z"
  }
}
```

---

### 2.7. Query Connected Devices List
Used by field tablets or mobile coordinators to view nearby online responders and mesh nodes.

- **Method**: `GET`
- **Endpoint**: `/api/devices`
- **Query Filters**: `?role=RESPONDER&status=ONLINE&search=Boat`

#### Expected Response (`200 OK`)
```json
{
  "devices": [
    {
      "id": "dev-002",
      "deviceId": "NODE-002",
      "userName": "Boat Alpha",
      "role": "RESPONDER",
      "deviceType": "BOAT_GPS",
      "latitude": 26.1305,
      "longitude": 86.6103,
      "battery": 65,
      "status": "ONLINE",
      "locationName": "Sector 2B",
      "lastSeen": "2026-09-26T12:34:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 2.8. On-Demand Gemini AI Triage Testing
Allows testing emergency classification on any raw text message before sending.

- **Method**: `POST`
- **Endpoint**: `/api/gemini/triage`

#### Request Payload
```json
{
  "message": "Embankment breach spotted! Water rushing into settlement.",
  "senderName": "Squad Charlie",
  "senderRole": "RESPONDER",
  "locationName": "Sector 4"
}
```

#### Expected Response (`200 OK`)
```json
{
  "success": true,
  "analysis": {
    "severity": "P1",
    "severityLabel": "CRITICAL",
    "confidence": 0.94,
    "reason": "Embankment breach creates immediate inundation risk threatening entire settlement.",
    "casualties": 0,
    "vulnerabilities": ["embankment_breach", "rapid_inundation"],
    "urgency": "IMMEDIATE",
    "recommendedAction": "Issue sector evacuation alarm and deploy reinforcement teams.",
    "analyzedAt": "2026-09-26T12:46:00.000Z"
  }
}
```

---

## 3. Error Codes & Handling

| HTTP Status | Error Structure | Scenario |
| :--- | :--- | :--- |
| `400 Bad Request` | `{"error": "deviceId is required"}` | Missing mandatory fields in registration or heartbeat |
| `404 Not Found` | `{"error": "Message not found"}` | Querying or updating a non-existent message ID |
| `500 Internal Error` | `{"error": "<error message>"}` | Server-side execution exception |
