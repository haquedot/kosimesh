import { db } from '@/lib/db/store';
import { analyzeEmergencyMessage } from '@/lib/gemini/triage';

// River waypoint coordinates along Kosi basin for boat patrols
const BOAT_ALPHA_WAYPOINTS = [
  { lat: 26.1305, lng: 86.6103, loc: 'Sector 2B' },
  { lat: 26.1340, lng: 86.6140, loc: 'Sector 2B North' },
  { lat: 26.1380, lng: 86.6180, loc: 'Kosi Main Channel' },
  { lat: 26.1320, lng: 86.6120, loc: 'Sector 2B Central' },
  { lat: 26.1280, lng: 86.6080, loc: 'Sector 2B South' },
];

const BOAT_BRAVO_WAYPOINTS = [
  { lat: 26.1220, lng: 86.6122, loc: 'Sector 3A' },
  { lat: 26.1260, lng: 86.6160, loc: 'Sector 3A Sandbar' },
  { lat: 26.1290, lng: 86.6190, loc: 'Sector 3A East' },
  { lat: 26.1240, lng: 86.6140, loc: 'Sector 3A Channel' },
];

let waypointIndexAlpha = 0;
let waypointIndexBravo = 0;

export async function advanceSimulationTick() {
  // Move Boat Alpha
  waypointIndexAlpha = (waypointIndexAlpha + 1) % BOAT_ALPHA_WAYPOINTS.length;
  const wpAlpha = BOAT_ALPHA_WAYPOINTS[waypointIndexAlpha];
  const boatAlpha = db.getDeviceById('NODE-002');
  if (boatAlpha) {
    db.updateHeartbeat('NODE-002', {
      latitude: wpAlpha.lat,
      longitude: wpAlpha.lng,
      battery: Math.max(15, boatAlpha.battery - 1),
      status: 'ONLINE',
    });
  }

  // Move Boat Bravo
  waypointIndexBravo = (waypointIndexBravo + 1) % BOAT_BRAVO_WAYPOINTS.length;
  const wpBravo = BOAT_BRAVO_WAYPOINTS[waypointIndexBravo];
  const boatBravo = db.getDeviceById('NODE-004');
  if (boatBravo) {
    db.updateHeartbeat('NODE-004', {
      latitude: wpBravo.lat,
      longitude: wpBravo.lng,
      battery: Math.max(10, boatBravo.battery - 1),
      status: 'ONLINE',
    });
  }

  return {
    boatAlpha: { wp: wpAlpha, battery: boatAlpha?.battery },
    boatBravo: { wp: wpBravo, battery: boatBravo?.battery },
  };
}

export async function triggerFlashFloodScenario() {
  const messageText = 'Water has rapidly surged past 6 feet in Supaul Ward 7. Six family members including 2 infants are stranded on the tin shed roof with rising current.';
  const senderName = 'Ravi Shankar';
  const locationName = 'Supaul Ward 7';
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

  // Also auto-register new device on map
  db.upsertDevice({
    deviceId: newMsg.senderId,
    userName: senderName,
    role: 'USER',
    deviceType: 'PHONE',
    latitude,
    longitude,
    battery: 42,
    status: 'SOS',
    locationName,
  });

  return newMsg;
}

export async function triggerLowFuelScenario() {
  const boatBravo = db.getDeviceById('NODE-004');
  if (boatBravo) {
    db.updateHeartbeat('NODE-004', { battery: 14, status: 'WARNING' });
  }

  const messageText = 'Boat Bravo fuel critically low at 14%. Immediate refueling dock needed near Sandbar 2 or propulsion will stall within 20 mins.';
  const senderName = 'Boat Bravo';
  const locationName = 'Sector 3A Sandbar';

  const analysis = await analyzeEmergencyMessage(messageText, {
    senderName,
    senderRole: 'RESPONDER',
    locationName,
    latitude: 26.1220,
    longitude: 86.6122,
  });

  const newMsg = db.createMessage({
    senderId: 'NODE-004',
    senderName,
    senderRole: 'RESPONDER',
    message: messageText,
    messageType: 'RESOURCE_REQ',
    latitude: 26.1220,
    longitude: 86.6122,
    locationName,
    severity: analysis.severity,
    severityReason: analysis.reason,
    geminiAnalysis: analysis,
    status: 'UNREAD',
  });

  return newMsg;
}
