# KosiMesh — Mobile App Quick Integration Guide

**Base URL**: `https://kosimesh.vercel.app`  
**Required Headers**:
```http
Content-Type: application/json
x-mesh-api-key: km_live_mesh_secret_2026
```
*(Or `Authorization: Bearer km_live_mesh_secret_2026`)*

---

## 1. On App Launch (Register Device)
`POST /api/devices/register`

```json
// Request
{
  "deviceId": "NODE-001",
  "userName": "Alex Mercer",
  "role": "USER",             // "USER" or "RESPONDER"
  "latitude": 26.1201,
  "longitude": 86.5902,
  "battery": 85,
  "status": "ONLINE",
  "locationName": "Sector Alpha"
}

// Response (201)
{
  "success": true,
  "device": { "id": "dev-001", "deviceId": "NODE-001", "status": "ONLINE" }
}
```

---

## 2. Background Loop Every 15–30s (Heartbeat)
`POST /api/devices/heartbeat`

```json
// Request
{
  "deviceId": "NODE-001",
  "latitude": 26.1205,
  "longitude": 86.5908,
  "battery": 82,
  "status": "ONLINE"
}

// Response (200)
{ "success": true }
```

---

## 3. Send SOS / Situation Report (Auto-Triaged by Gemini AI)
`POST /api/messages`

```json
// Request
{
  "senderId": "NODE-001",
  "senderName": "Alex Mercer",
  "senderRole": "USER",
  "message": "Water reached 1st floor, 5 trapped on roof. Urgent help needed!",
  "messageType": "SOS",
  "latitude": 26.1201,
  "longitude": 86.5902,
  "locationName": "Sector Alpha"
}

// Response (201) -> Returns instant AI Priority Assessment
{
  "success": true,
  "message": {
    "id": "MSG-1025",
    "severity": "P1",
    "status": "UNREAD",
    "geminiAnalysis": {
      "severity": "P1",
      "severityLabel": "CRITICAL",
      "recommendedAction": "Dispatch Rescue Squad Alpha to Sector Alpha."
    }
  }
}
```

---

## 4. Poll Status & Admin Replies
`GET /api/messages/:id` (e.g. `/api/messages/MSG-1025`)

```json
// Response (200)
{
  "message": {
    "id": "MSG-1025",
    "status": "IN_PROGRESS",        // "UNREAD" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED"
    "assignedResponderName": "Rescue Squad Alpha",
    "replies": [
      {
        "senderName": "Command Post",
        "senderRole": "ADMIN",
        "message": "Boat Alpha en route. ETA 10 mins.",
        "createdAt": "2026-09-26T12:38:00Z"
      }
    ]
  }
}
```

---

## 5. Reply to Command Center
`POST /api/messages/:id/reply` (e.g. `/api/messages/MSG-1025/reply`)

```json
// Request
{
  "senderId": "NODE-001",
  "senderName": "Alex Mercer",
  "senderRole": "USER",
  "message": "We see the boat approaching now."
}

// Response (201)
{ "success": true }
```

---

## 6. (Responder Only) Update Status
`PATCH /api/messages/:id/status` (e.g. `/api/messages/MSG-1025/status`)

```json
// Request
{
  "status": "RESOLVED"       // "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED"
}

// Response (200)
{ "success": true }
```
