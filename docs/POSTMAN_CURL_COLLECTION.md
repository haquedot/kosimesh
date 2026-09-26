# KosiMesh — Postman & cURL Testing Collection

> **Base URL**: `https://kosimesh.vercel.app`  
> **API Key Header**: `x-mesh-api-key: km_live_mesh_secret_2026`  
> **Tip for Postman**: You can copy any of the `curl` commands below and paste directly into Postman using **Import $\rightarrow$ Raw Text**.

---

### 1. Register a Device / Mobile Node
Registers a civilian or responder device on the mesh network.

```bash
curl -X POST "https://kosimesh.vercel.app/api/devices/register" \
  -H "Content-Type: application/json" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026" \
  -d '{
    "deviceId": "NODE-001",
    "userName": "Alex Mercer",
    "role": "USER",
    "deviceType": "PHONE",
    "latitude": 26.1201,
    "longitude": 86.5902,
    "battery": 85,
    "status": "ONLINE",
    "locationName": "Sector Alpha"
  }'
```

---

### 2. Send Periodic Heartbeat (GPS & Battery Sync)
Simulates periodic telemetry updates (runs every 15–30s in mobile background).

```bash
curl -X POST "https://kosimesh.vercel.app/api/devices/heartbeat" \
  -H "Content-Type: application/json" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026" \
  -d '{
    "deviceId": "NODE-001",
    "latitude": 26.1205,
    "longitude": 86.5908,
    "battery": 82,
    "status": "ONLINE"
  }'
```

---

### 3. List Connected Devices
Fetches all active mesh nodes with optional filtering.

```bash
curl -X GET "https://kosimesh.vercel.app/api/devices" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026"
```

*With role and status filters:*
```bash
curl -X GET "https://kosimesh.vercel.app/api/devices?role=RESPONDER&status=ONLINE" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026"
```

---

### 4. Send Emergency SOS / Report (Auto-Triaged by Gemini AI)
Submits a distress call. The server invokes Gemini 2.5 Flash to automatically determine severity (P1–P4), casualties, vulnerabilities, urgency, and recommended actions.

```bash
curl -X POST "https://kosimesh.vercel.app/api/messages" \
  -H "Content-Type: application/json" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026" \
  -d '{
    "senderId": "NODE-001",
    "senderName": "Alex Mercer",
    "senderRole": "USER",
    "message": "Water has entered our 1st floor and 5 people are trapped on the roof with an infant. Urgent boat rescue needed.",
    "messageType": "SOS",
    "latitude": 26.1201,
    "longitude": 86.5902,
    "locationName": "Sector Alpha"
  }'
```

---

### 5. Query Messages Inbox & Filter by Priority
Fetches messages from the central triage inbox.

```bash
curl -X GET "https://kosimesh.vercel.app/api/messages" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026"
```

*Filter only Critical (P1) and Unread messages:*
```bash
curl -X GET "https://kosimesh.vercel.app/api/messages?severity=P1&status=UNREAD" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026"
```

---

### 6. Get Single Message & Conversation Thread
Retrieves full incident details, responder assignments, and thread replies.

```bash
curl -X GET "https://kosimesh.vercel.app/api/messages/MSG-1001" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026"
```

---

### 7. Send Two-Way Reply to Message Thread
Sends a reply from a field device or commander into the active incident thread.

```bash
curl -X POST "https://kosimesh.vercel.app/api/messages/MSG-1001/reply" \
  -H "Content-Type: application/json" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026" \
  -d '{
    "senderId": "NODE-001",
    "senderName": "Alex Mercer",
    "senderRole": "USER",
    "message": "We can see Rescue Boat Alpha approaching our street now. Waving white cloth."
  }'
```

---

### 8. Update Incident Status & Assign Tactical Squad
Used by field responders or dispatchers to update status (`ACKNOWLEDGED`, `IN_PROGRESS`, `RESOLVED`).

```bash
curl -X PATCH "https://kosimesh.vercel.app/api/messages/MSG-1001/status" \
  -H "Content-Type: application/json" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026" \
  -d '{
    "status": "IN_PROGRESS",
    "assignedResponderId": "NODE-002",
    "assignedResponderName": "Rescue Squad Alpha"
  }'
```

*Mark as Resolved:*
```bash
curl -X PATCH "https://kosimesh.vercel.app/api/messages/MSG-1001/status" \
  -H "Content-Type: application/json" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026" \
  -d '{
    "status": "RESOLVED"
  }'
```

---

### 9. Emergency Mesh Broadcast
Dispatches a mass priority alert to all nodes across the mesh.

```bash
curl -X POST "https://kosimesh.vercel.app/api/messages/broadcast" \
  -H "Content-Type: application/json" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026" \
  -d '{
    "message": "FLASH FLOOD EVACUATION: Surge discharge approaching Sector Alpha. All citizens move to designated high ground shelters immediately.",
    "severity": "P1",
    "locationName": "All Operational Sectors"
  }'
```

---

### 10. Direct On-Demand Gemini AI Triage Test
Tests raw text analysis using Gemini 2.5 Flash without persisting to the database.

```bash
curl -X POST "https://kosimesh.vercel.app/api/gemini/triage" \
  -H "Content-Type: application/json" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026" \
  -d '{
    "message": "River embankment breached! Water rushing rapidly into settlement. 12 people trapped in Community Hall.",
    "senderName": "Field Unit Bravo",
    "senderRole": "RESPONDER",
    "locationName": "Sector Charlie"
  }'
```

---

### 11. Fetch System KPI Metrics & Severity Counts
Retrieves aggregate live metrics, online responder counts, and severity distribution.

```bash
curl -X GET "https://kosimesh.vercel.app/api/metrics" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026"
```

---

### 12. Trigger Simulator Patrol Step
Triggers an immediate simulation patrol loop step to move responder units and update telemetry.

```bash
curl -X POST "https://kosimesh.vercel.app/api/simulator" \
  -H "Content-Type: application/json" \
  -H "x-mesh-api-key: km_live_mesh_secret_2026" \
  -d '{
    "action": "STEP"
  }'
```
