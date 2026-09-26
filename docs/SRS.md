
## High-Level SRS

### 1. System Roles

| Role          | Responsibility                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| **Admin**     | Monitor devices, receive messages, use Gemini severity analysis, coordinate/communicate with responders |
| **Responder** | Field personnel who use the mobile application, share GPS and send/receive messages                     |
| **User**      | Person reporting an emergency/request; can send messages and location                                   |

### 2. Core System

```text
                    ┌─────────────────────┐
                    │    ADMIN DASHBOARD  │
                    │                     │
                    │  Admin              │
                    │    │                │
                    │    ├── Devices      │
                    │    ├── Messages     │
                    │    └── Severity     │
                    └─────────┬───────────┘
                              │
                         Internet
                              │
                    ┌─────────▼───────────┐
                    │     BACKEND API     │
                    │                     │
                    │ Authentication      │
                    │ Device Management   │
                    │ Message Management  │
                    │ Gemini Integration  │
                    └──────┬───────┬──────┘
                           │       │
                 ┌─────────▼─┐   ┌─▼─────────┐
                 │ Devices   │   │ Messages  │
                 │           │   │           │
                 │ GPS       │   │ Reports   │
                 │ Status    │   │ SOS       │
                 │ User      │   │ Requests  │
                 └───────────┘   └───────────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │    GEMINI     │
                              │ Severity      │
                              │ Analysis      │
                              └───────┬───────┘
                                      │
                                      ▼
                              Admin Dashboard
```

The local-first architecture remains important: field nodes can operate without Internet, while synchronization occurs when connectivity becomes available. The source architecture explicitly describes phones, laptops and boats as local nodes with local state and mesh communication. 

---

# 3. Main Document 1 — Connected Devices

This is the **device tracking document/table**.

### Device fields

```text
ConnectedDevice
────────────────────────
id
deviceId
userId
role
deviceType
latitude
longitude
battery
status
lastSeen
createdAt
updatedAt
```

Example:

```json
{
  "deviceId": "NODE-001",
  "userId": "USR-102",
  "role": "RESPONDER",
  "deviceType": "PHONE",
  "latitude": 26.1201,
  "longitude": 86.5902,
  "battery": 78,
  "status": "ONLINE",
  "lastSeen": "2026-09-26T12:30:10Z"
}
```

### Admin view

```text
CONNECTED DEVICES

┌────────┬─────────────┬───────────┬────────────┬─────────┐
│ Device │ User        │ Role      │ Location   │ Status  │
├────────┼─────────────┼───────────┼────────────┼─────────┤
│ NODE01 │ Rahul       │ Responder │ 26.12,86.59│ 🟢      │
│ NODE02 │ Aman        │ Responder │ 26.13,86.61│ 🟢      │
│ NODE03 │ User 103    │ User      │ 26.15,86.63│ 🟠      │
└────────┴─────────────┴───────────┴────────────┴─────────┘
```

The Admin should also have a **map view** where these GPS coordinates appear as markers.

---

# 4. Device API

The mobile application primarily needs:

### Register device

```http
POST /api/devices/register
```

### Update GPS/status

```http
POST /api/devices/heartbeat
```

Example:

```json
{
  "deviceId": "NODE-001",
  "latitude": 26.1201,
  "longitude": 86.5902,
  "battery": 78,
  "status": "ONLINE"
}
```

### Admin APIs

```http
GET /api/devices
GET /api/devices/:id
```

This gives Admin the current connected-device list.

---

# 5. Main Document 2 — Messages

The second primary document should be the **Messages collection/table**.

Every communication should become a message record.

### Message fields

```text
Message
────────────────────
id
senderId
senderRole
receiverId
message
messageType
severity
severityReason
latitude
longitude
status
geminiAnalysis
createdAt
updatedAt
```

Example:

```json
{
  "id": "MSG-1001",
  "senderId": "USR-103",
  "senderRole": "USER",
  "message": "Water has entered our house and five people are trapped on the roof.",
  "messageType": "SOS",
  "latitude": 26.1201,
  "longitude": 86.5902,
  "severity": "CRITICAL",
  "severityReason": "Multiple people trapped with active flooding.",
  "status": "UNREAD"
}
```

---

# 6. Gemini Severity Analysis

This becomes the **main AI feature of the Admin Dashboard**.

The flow should be:

```text
User / Responder
       │
       │ Message + Location
       ▼
   Backend API
       │
       ▼
     Gemini
       │
       ├── Severity
       ├── Reason
       └── Suggested response
       │
       ▼
    Database
       │
       ▼
 Admin Dashboard
```

### Important distinction

**Gemini should recommend/classify severity; Admin remains the decision-maker.**

For example:

```text
┌──────────────────────────────────────────────┐
│ 🚨 NEW EMERGENCY MESSAGE                    │
├──────────────────────────────────────────────┤
│ From: Rahul Kumar                            │
│ Role: User                                   │
│ Location: Supaul                             │
│                                              │
│ "5 people are trapped on the roof..."       │
│                                              │
│ ───────── GEMINI ANALYSIS ─────────          │
│                                              │
│ Severity: 🔴 CRITICAL                       │
│ Confidence: 94%                              │
│                                              │
│ Reason:                                      │
│ Multiple people are trapped and flooding     │
│ is actively affecting the location.         │
│                                              │
│ Suggested Action:                            │
│ Prioritize rescue response.                  │
│                                              │
│ [ACKNOWLEDGE] [CONTACT RESPONDER]           │
└──────────────────────────────────────────────┘
```

The existing project already defines incident triage into **P1–P4 priority levels** and extraction of information such as casualty count, vulnerability and urgency. 

You could therefore map Gemini's output to:

```text
P1 — Critical
P2 — High
P3 — Moderate
P4 — Low
```

---

# 7. Gemini Output Schema

Don't store only a text response from Gemini.

Make Gemini return structured JSON:

```json
{
  "severity": "P1",
  "severityLabel": "CRITICAL",
  "confidence": 0.94,
  "reason": "Multiple people are trapped due to flooding.",
  "casualties": 5,
  "vulnerabilities": [
    "elderly"
  ],
  "urgency": "IMMEDIATE",
  "recommendedAction": "Prioritize rescue response."
}
```

Then store the analysis alongside the original message.

This makes the dashboard easy to filter:

```text
ALL       P1       P2       P3       P4
 │         │
 ▼         ▼
 43       7 Critical
```

---

# 8. Messages Dashboard

The Admin should have a dedicated message inbox.

```text
MESSAGES
────────────────────────────────────────────────────

🔴 P1   Rahul Kumar
       5 people trapped on rooftop
       Supaul
       12:31 PM

🟠 P2   Responder: Boat Alpha
       Requesting additional fuel
       Sector 2B
       12:29 PM

🟡 P3   User
       Water level increasing
       Saharsa
       12:27 PM
```

Filters:

```text
[All] [Unread] [P1] [P2] [P3] [P4]

Role:
[All] [User] [Responder]

Status:
[Unread] [Acknowledged] [Resolved]
```

---

# 9. Message Details

Clicking a message:

```text
MESSAGE #MSG-1001

Sender
────────────────────
Rahul Kumar
Role: USER
Device: NODE-003

Message
────────────────────
"Five people are trapped on our roof.
Water is rising quickly."

Location
────────────────────
📍 Supaul
26.1201, 86.5902

Gemini Assessment
────────────────────
Severity       P1 — CRITICAL
Confidence     94%
Casualties     5
Urgency        IMMEDIATE

Reason
────────────────────
Multiple people are trapped while
flooding is actively increasing.

Admin Actions
────────────────────
[ACKNOWLEDGE]
[CONTACT RESPONDER]
[SEND MESSAGE]
[MARK RESOLVED]
```

---

# 10. Admin → Responder/User

Messages should work both ways.

```text
User/Responder
      │
      │ SEND
      ▼
    Admin
      │
      │ REPLY
      ▼
User/Responder
```

API:

```http
POST /api/messages
GET  /api/messages
GET  /api/messages/:id
POST /api/messages/:id/reply
PATCH /api/messages/:id/status
```

---

# 11. Role Permissions

### Admin

```text
✓ View all devices
✓ View GPS locations
✓ View all messages
✓ Send messages
✓ Analyze severity with Gemini
✓ Acknowledge messages
✓ Change message status
✓ View map
✓ View responders
✓ View users
```

### Responder

```text
✓ Send messages
✓ Receive admin messages
✓ Share GPS
✓ Update availability/status
✓ View assigned/relevant information
```

### User

```text
✓ Send emergency/report message
✓ Share GPS
✓ Receive admin/responder response
✓ View own messages
```

---

# 12. Simplified Database

You can keep the backend very small:

```text
users
─────
id
name
phone
role
status

devices
───────
id
deviceId
userId
latitude
longitude
battery
status
lastSeen

messages
────────
id
senderId
receiverId
senderRole
message
messageType
latitude
longitude
severity
severityReason
geminiAnalysis
status
createdAt
updatedAt
```

That's enough for the **first Admin Dashboard MVP**.

---

# 13. Final MVP Architecture

```text
                         INTERNET
                            │
                            ▼
                ┌──────────────────────┐
                │      BACKEND         │
                │                      │
                │ Auth                 │
                │ Device API           │
                │ Message API          │
                │ Gemini API           │
                └───────┬───────┬──────┘
                        │       │
             ┌──────────┘       └──────────┐
             ▼                             ▼
       ┌─────────────┐               ┌─────────────┐
       │   DEVICES   │               │  MESSAGES   │
       │             │               │             │
       │ GPS         │               │ Reports     │
       │ Status      │               │ SOS         │
       │ Battery     │               │ Requests    │
       │ User        │               │ Replies     │
       └─────────────┘               └──────┬──────┘
                                            │
                                            ▼
                                      ┌───────────┐
                                      │  GEMINI   │
                                      │           │
                                      │ Severity  │
                                      │ Analysis  │
                                      └─────┬─────┘
                                            │
                                            ▼
                                  ┌──────────────────┐
                                  │  ADMIN DASHBOARD │
                                  │                  │
                                  │ Overview         │
                                  │ Live Map         │
                                  │ Devices          │
                                  │ Messages         │
                                  │ Severity Alerts  │
                                  └──────────────────┘
```

### So the SRS can be reduced to **4 major Admin functions**:

**1. Device Monitoring**
Connected devices + GPS + status.

**2. Message Management**
Receive, view, filter, acknowledge and respond to messages.

**3. Gemini Severity Analysis**
Automatically analyze incoming messages and classify **P1/P2/P3/P4**, with reasoning shown to Admin.

**4. Command & Communication**
Admin can respond to users/responders and coordinate the field response.

This is a much cleaner scope for the hackathon than implementing the entire broader asset/hazard/incident-management platform in the Admin Dashboard.
