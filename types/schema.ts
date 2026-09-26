export type DeviceRole = 'RESPONDER' | 'USER' | 'ADMIN';
export type DeviceType = 'PHONE' | 'BOAT_GPS' | 'BASE_STATION' | 'DRONE';
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'WARNING' | 'SOS';

export interface ConnectedDevice {
  id: string;              // Internal UUID / Unique string
  deviceId: string;        // Node ID (e.g. "NODE-001", "BOAT-ALPHA")
  userId?: string;         // Assigned user ID
  userName: string;        // User or Responder display name
  role: DeviceRole;        // "RESPONDER" | "USER" | "ADMIN"
  deviceType: DeviceType;  // "PHONE" | "BOAT_GPS" | "BASE_STATION" | "DRONE"
  latitude: number;        // GPS Latitude
  longitude: number;       // GPS Longitude
  battery: number;         // 0 - 100 percentage
  status: DeviceStatus;    // "ONLINE" | "OFFLINE" | "WARNING" | "SOS"
  locationName: string;    // e.g. "Supaul", "Sector 2B", "Saharsa"
  lastSeen: string;        // ISO 8601 Timestamp
  createdAt: string;       // ISO 8601 Timestamp
  updatedAt: string;       // ISO 8601 Timestamp
}

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export type SeverityLabel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
export type MessageType = 'SOS' | 'REPORT' | 'RESOURCE_REQ' | 'DISPATCH' | 'REPLY';
export type MessageStatus = 'UNREAD' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';
export type UrgencyLevel = 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface GeminiAnalysisResult {
  severity: PriorityLevel;
  severityLabel: SeverityLabel;
  confidence: number;                  // 0.00 to 1.00
  reason: string;                      // Detailed explanation
  casualties: number;                  // Number of people trapped/affected
  vulnerabilities: string[];           // e.g. ["children", "elderly", "medical_need", "trapped_roof"]
  urgency: UrgencyLevel;               // "IMMEDIATE" | "HIGH" | "MEDIUM" | "LOW"
  recommendedAction: string;           // Tactical instruction for Commander
  analyzedAt: string;                  // ISO 8601
}

export interface MessageReply {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: DeviceRole;
  message: string;
  createdAt: string;
}

export interface Message {
  id: string;                          // e.g. "MSG-1001"
  senderId: string;                    // DeviceId or UserId
  senderName: string;                  // e.g. "Rahul Kumar" / "Boat Alpha"
  receiverId?: string;                 // Target recipient or "ADMIN"
  senderRole: DeviceRole;              // "USER" | "RESPONDER" | "ADMIN"
  message: string;                     // Raw text body
  messageType: MessageType;            // "SOS" | "REPORT" | "RESOURCE_REQ" | ...
  latitude?: number;                   // Incident GPS
  longitude?: number;                  // Incident GPS
  locationName: string;                // e.g. "Supaul", "Sector 2B", "Saharsa"
  severity: PriorityLevel;             // "P1" | "P2" | "P3" | "P4"
  severityReason?: string;             // Short reason summary
  geminiAnalysis?: GeminiAnalysisResult; // Detailed AI classification
  status: MessageStatus;               // "UNREAD" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED"
  isNew?: boolean;                     // Flag for newly arrived messages
  assignedResponderId?: string;        // ID of responder assigned (e.g. "NODE-002")
  assignedResponderName?: string;      // Display name of responder
  replies?: MessageReply[];            // Two-way thread replies
  createdAt: string;                   // ISO 8601
  updatedAt: string;                   // ISO 8601
}

export interface SystemMetrics {
  totalMessages: number;
  totalMessagesChangePct: number;
  criticalP1Count: number;
  criticalP1Change: number;
  activeResponders: number;
  activeRespondersChange: number;
  connectedDevices: number;
  connectedDevicesChange: number;
  severityDistribution: {
    p1: number;
    p2: number;
    p3: number;
    p4: number;
  };
}
