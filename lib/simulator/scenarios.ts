import { db } from '@/lib/db/store';
import { analyzeEmergencyMessage } from '@/lib/gemini/triage';

// Dynamic waypoints for tactical patrol simulation
const PATROL_WAYPOINTS = [
  { lat: 26.1305, lng: 86.6103, loc: 'Sector Alpha North' },
  { lat: 26.1340, lng: 86.6140, loc: 'Sector Alpha Perimeter' },
  { lat: 26.1380, lng: 86.6180, loc: 'Main River Transit Point' },
  { lat: 26.1320, lng: 86.6120, loc: 'Sector Bravo Central' },
  { lat: 26.1280, lng: 86.6080, loc: 'Sector Bravo South' },
  { lat: 26.1220, lng: 86.6122, loc: 'Sector Charlie Staging' },
];

let waypointIndex = 0;

export async function advanceSimulationTick() {
  const devices = db.getDevices({ role: 'RESPONDER' });
  
  // If no responder units exist, dynamically create patrol vessels
  if (devices.length === 0) {
    db.upsertDevice({
      deviceId: 'NODE-002',
      userName: 'Rescue Squad Alpha',
      role: 'RESPONDER',
      deviceType: 'BOAT_GPS',
      latitude: 26.1305,
      longitude: 86.6103,
      battery: 85,
      status: 'ONLINE',
      locationName: 'Sector Alpha North',
    });
    db.upsertDevice({
      deviceId: 'NODE-004',
      userName: 'Rescue Squad Bravo',
      role: 'RESPONDER',
      deviceType: 'BOAT_GPS',
      latitude: 26.1220,
      longitude: 86.6122,
      battery: 70,
      status: 'ONLINE',
      locationName: 'Sector Charlie Staging',
    });
  }

  waypointIndex = (waypointIndex + 1) % PATROL_WAYPOINTS.length;
  const currentWp = PATROL_WAYPOINTS[waypointIndex];

  const responders = db.getDevices({ role: 'RESPONDER' });
  responders.forEach((resp, idx) => {
    const wp = PATROL_WAYPOINTS[(waypointIndex + idx * 2) % PATROL_WAYPOINTS.length];
    db.updateHeartbeat(resp.deviceId, {
      latitude: wp.lat,
      longitude: wp.lng,
      battery: Math.max(15, resp.battery - 1),
      status: 'ONLINE',
    });
  });

  return {
    activeResponders: responders.length,
    currentWaypoint: currentWp,
  };
}

export async function triggerFlashFloodScenario() {
  const messageText = 'Rapid water surge exceeding 6 feet! Six individuals including 2 infants are stranded on the roof with fast current. Urgent extraction needed.';
  const senderName = 'Alex Mercer';
  const locationName = 'Sector Alpha East';
  const latitude = 26.1285;
  const longitude = 86.5940;

  // Run AI triage
  const analysis = await analyzeEmergencyMessage(messageText, {
    senderName,
    senderRole: 'USER',
    locationName,
    latitude,
    longitude,
  });

  const newMsg = db.createMessage({
    senderId: `NODE-USR-${Math.floor(100 + Math.random() * 900)}`,
    senderName,
    senderRole: 'USER',
    message: messageText,
    messageType: 'SOS',
    latitude,
    longitude,
    locationName,
    severity: analysis.severity,
    severityReason: analysis.reason,
    geminiAnalysis: analysis,
    status: 'UNREAD',
  });

  // Auto-register citizen node on map
  db.upsertDevice({
    deviceId: newMsg.senderId,
    userName: senderName,
    role: 'USER',
    deviceType: 'PHONE',
    latitude,
    longitude,
    battery: 62,
    status: 'SOS',
    locationName,
  });

  return newMsg;
}

export async function triggerLowFuelScenario() {
  const messageText = 'Rescue Squad Bravo reports battery level critically low at 14%. Need battery swap / charging depot en route.';
  const senderName = 'Rescue Squad Bravo';
  const locationName = 'Sector Charlie';
  const latitude = 26.1220;
  const longitude = 86.6122;

  const analysis = await analyzeEmergencyMessage(messageText, {
    senderName,
    senderRole: 'RESPONDER',
    locationName,
    latitude,
    longitude,
  });

  const newMsg = db.createMessage({
    senderId: 'NODE-004',
    senderName,
    senderRole: 'RESPONDER',
    message: messageText,
    messageType: 'RESOURCE_REQ',
    latitude,
    longitude,
    locationName,
    severity: analysis.severity,
    severityReason: analysis.reason,
    geminiAnalysis: analysis,
    status: 'UNREAD',
  });

  db.upsertDevice({
    deviceId: 'NODE-004',
    userName: senderName,
    role: 'RESPONDER',
    deviceType: 'BOAT_GPS',
    latitude,
    longitude,
    battery: 14,
    status: 'WARNING',
    locationName,
  });

  return newMsg;
}
