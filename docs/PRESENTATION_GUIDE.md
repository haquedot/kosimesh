# KosiMesh — Universal Emergency Response & AI Triage Command Platform
## Official Pitch Deck & Presentation Guide (Google DeepMind Hackathon)

> **Live Deployment**: [https://kosimesh.vercel.app](https://kosimesh.vercel.app)  
> **Source Repository**: [https://github.com/haquedot/kosimesh.git](https://github.com/haquedot/kosimesh.git)  
> **Target Audience**: Hackathon Judges, Disaster Management Authorities (NDRF/SDRF/FEMA), Incident Commanders, First Responder Agencies.

---

## Executive Summary (The 30-Second Elevator Pitch)

During catastrophic disasters—floods, cyclones, earthquakes, or wildfires—**traditional cellular towers and power grids collapse first**. First responders are blinded, and emergency helplines are overwhelmed with thousands of unstructured distress calls.

**KosiMesh** is an off-grid resilient emergency coordination command platform that bridges low-bandwidth decentralized RF mesh networks with **Google Gemini 2.5 Flash AI structured triage**. It automatically extracts life-critical signals, assesses casualty numbers, tags vulnerabilities (elderly, infants, trapped on roofs), calculates P1–P4 tactical severity, and presents Incident Commanders with an interactive tactical GIS radar and one-click dispatch system—deployable anywhere in the world in minutes.

---

## 1. The Core Problem vs. The KosiMesh Solution

```
┌─────────────────────────────────────────────────────────────┐
│                     THE CRISIS REALITY                      │
├──────────────────────────────┬──────────────────────────────┤
│ Conventional Disaster Ops    │ KosiMesh Solution            │
├──────────────────────────────┼──────────────────────────────┤
│ ❌ Telecom Grid Failure      │ ✅ Decentralized Multi-Hop   │
│    Cell towers lose power    │    RF Mesh (LoRa / 868 MHz / │
│    and backhaul lines cut.   │    WiFi-Direct / WebSockets) │
├──────────────────────────────┼──────────────────────────────┤
│ ❌ Information Overload      │ ✅ Automated Gemini 2.5      │
│    Unstructured voice calls  │    Flash AI Triage Engine    │
│    cause triage delays.      │    (P1–P4 within 300ms)      │
├──────────────────────────────┼──────────────────────────────┤
│ ❌ Blind Field Units         │ ✅ Real-Time Two-Way Dispatch│
│    Rescue squads lack GPS    │    Tactical instructions &   │
│    coordinates and context.  │    RF broadcast to mobile nodes│
├──────────────────────────────┼──────────────────────────────┤
│ ❌ Region-Locked Software    │ ✅ 100% Location-Agnostic    │
│    Hardcoded map boundaries. │    Auto-centroid bounding box│
│                              │    for any disaster globally.│
└──────────────────────────────┴──────────────────────────────┘
```

---

## 2. Key Architectural Pillars

### 1. 🤖 Automated Gemini 2.5 Flash Triage Engine
- Translates raw, chaotic civilian distress transcripts into actionable tactical JSON schemas.
- **Key Extracted Fields**:
  - **Severity**: `P1` (Critical/Life-Threatening), `P2` (High), `P3` (Moderate), `P4` (Low/Informational).
  - **Casualty Count**: Numerical extraction of trapped or injured individuals.
  - **Vulnerability Tags**: `trapped_on_roof`, `rising_water`, `elderly`, `infant`, `medical_emergency`.
  - **Urgency Level**: `IMMEDIATE`, `HIGH`, `MEDIUM`, `LOW`.
  - **Recommended Tactical Action**: Pre-calculated directives tailored for the Duty Commander.
- **Resilient Fallback**: Zero-latency regex/heuristic rule classifier that triggers seamlessly if cloud connectivity is offline.

### 2. 🗺️ Tactical Multi-Layer GIS Command Radar
- **Dynamic Bounding Box (`fitBounds`)**: Calculates dynamic centroids and bounding boxes to frame active nodes anywhere globally.
- **4 Real-Time GIS Map Layer Providers**:
  - 🛰️ **Esri World Imagery** (Satellite flood & terrain inspection)
  - 🌑 **CartoDB Dark Matter** (High-contrast night ops & tactical HUD)
  - 🗺️ **OpenStreetMap** (Road networks & evacuation routes)
  - 🏔️ **OpenTopoMap** (Topographic contour lines & high-ground safety zones)

### 3. ⚡ High-Performance Hybrid Storage
- **In-Memory Cache**: Single-millisecond read/write latency for ultra-smooth UI updates.
- **MongoDB Atlas Integration**: Asynchronous write-behind synchronization for persistent historical archiving and post-disaster analytics.

### 4. 🔒 API Token Authentication & Mobile SDK
- Protected with `x-mesh-api-key: km_live_mesh_secret_2026` or Bearer token authorization.
- Ready for mobile client integration with sub-50ms heartbeat ingestion and two-way thread replies.

---

## 3. Product Features & Views Tour

```
┌────────────────────────────────────────────────────────────────────────┐
│                          KOSIMESH ADMIN UI                             │
├───────────────┬────────────────────────────────────────────────────────┤
│ 📊 Dashboard  │ KPI Cards, Live Satellite Map, Fleet Table, Triage Feed│
│ 🗺️ Full Map   │ Full-Screen Tactical GIS Console with Live Radar Feed │
│ 💬 Messages   │ Multi-Filter Triage Inbox (Cards & Dense Table Mode)   │
│ 📱 Devices    │ Fleet Management, Battery Reserves & RF Ping Inspector│
│ 👥 Users      │ Tactical Responder Squads & Registered Citizen Roster │
└───────────────┴────────────────────────────────────────────────────────┘
```

1. **Dashboard Overview**:
   - **Interactive KPI Cards**: Click directly into Critical P1, Responders, or Messages.
   - **Emergency Alert Banner**: Auditory and visual pulse for unresolved P1 life-threatening calls.
   - **Live Telemetry & Severity Distribution**: Instant visual breakdown of incoming incidents.

2. **Tactical Search & API Recommendations**:
   - Live header search bar with debounced API lookup across messages, nodes, and sectors.
   - Instant recommendation cards with one-click AI insight triggers and device inspection.

3. **Two-Way Dispatch & Emergency Mass Broadcast**:
   - Instant two-way conversation threading between Command Post and field units.
   - Mass radio broadcast pushing alerts to all connected mobile nodes.

4. **Built-in Patrol & Hazard Simulator**:
   - Dynamic simulation control bar supporting real-time patrol loops, battery depletion, and new incident injection for live demonstrations.

---

## 4. Suggested 3-Minute Live Presentation Script

### **Minute 0:00 – 0:45: The Problem Hook**
> *"Judges, when a disaster strikes—like a mega-flood or an earthquake—the power grid goes down, cell towers fail, and thousands of calls flood emergency numbers at once. First responders are left blind, and commanders cannot triage who needs a rescue boat first.*
> 
> *Meet **KosiMesh**: an intelligent, location-agnostic disaster response platform that combines off-grid mesh networking with Google Gemini 2.5 Flash to automatically triage and coordinate emergency rescues in real time."*

### **Minute 0:45 – 1:45: Live Dashboard & Gemini Triage Demo**
> *(Screen shows `https://kosimesh.vercel.app`)*
> 
> 1. *"Here on our Command Dashboard, notice how the fixed sidebar allows seamless navigation while the main console gives us a real-time tactical overview."*
> 2. *"When a civilian node sends an SOS—'5 people trapped on a rooftop with an infant, water rising fast'—our Gemini AI Triage immediately analyzes the payload."*
> 3. *(Click on message to open Gemini Insight Drawer)*: *"Within 300 milliseconds, Gemini identifies it as a **P1 Critical Alert**, extracts the 5 casualties, flags vulnerabilities like 'infant' and 'trapped on roof', and generates an immediate tactical recommendation for our Commander."*
> 4. *"With one click, the Commander can assign **Rescue Squad Alpha** and send two-way instructions back over the mesh."*

### **Minute 1:45 – 2:30: Tactical Map & Fleet Telemetry**
> *(Switch to Map View / Layers)*
> 
> 1. *"Our tactical map is 100% universal. Whether deployed in Bihar, Florida, or Tokyo, it dynamically calculates geographic centroids and bounding boxes."*
> 2. *(Switch between Satellite, Dark Canvas, and Topo layers)*: *"Commanders can switch to Topographic Relief to identify safe high ground, or Satellite imagery to inspect flood breaches."*
> 3. *(Open Search Bar and type 'water')*: *"Our header search offers real-time API recommendations, instantly pulling relevant incidents and responder nodes."*
> 4. *(Click on a device to open Device Detail Modal)*: *"We can inspect real-time battery reserves, GPS coordinates, and send an RF heartbeat ping."*

### **Minute 2:30 – 3:00: Impact, Security & Future Roadmap**
> 1. *"Our platform is production-ready, featuring API token security (`x-mesh-api-key`) and standardized REST endpoints for mobile app and IoT integration."*
> 2. *"By turning chaos into structured intelligence, KosiMesh cuts rescue response times from hours to minutes, saving lives where every second counts.*
> 3. *Thank you!"*

---

## 5. Technology Stack Summary

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons |
| **GIS & Mapping** | Leaflet, Esri World Imagery, CartoDB Dark Matter, OpenTopoMap |
| **AI Triage Engine** | Google Gemini 2.5 Flash (`@google/genai`), Structured JSON Schema |
| **Backend & APIs** | Next.js Route Handlers, Edge Middleware Token Authentication |
| **Data Layer** | Hybrid In-Memory Cache + MongoDB Atlas (`mongodb` driver) |
| **Deployment** | Vercel Serverless Edge Cloud |

---

## 6. Frequently Asked Questions (Judge Q&A Prep)

**Q1: What happens if internet connectivity to Gemini API is completely cut off at the incident post?**  
> *A: KosiMesh features an automated heuristic fallback classifier (`lib/gemini/fallback.ts`) that runs locally with zero external dependencies, categorizing severity and vulnerabilities immediately using emergency keyword heuristics.*

**Q2: How does the system prevent battery depletion on field mesh nodes?**  
> *A: Heartbeat payloads are ultra-compact (under 120 bytes). The dashboard continuously monitors battery levels and triggers alerts when a node drops below 25%, advising commanders to recall or recharge units.*

**Q3: Can KosiMesh be deployed for disasters other than floods?**  
> *A: Yes! The system prompt, heuristic engine, and GIS bounding boxes are completely universal and multi-hazard—supporting earthquakes, cyclones, wildfires, landslides, and urban mass-casualty incidents.*
