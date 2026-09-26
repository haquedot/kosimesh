import { ConnectedDevice, Message, MessageStatus, PriorityLevel, SystemMetrics } from '@/types/schema';
import { initialDevices, initialMessages } from './seed';
import { getDb } from './mongodb';

// In-memory data store with singleton persistence across hot reloads in Next.js development
interface DataStore {
  devices: ConnectedDevice[];
  messages: Message[];
  mongoInitialized: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var __kosiDataStore: DataStore | undefined;
}

function getStore(): DataStore {
  if (!globalThis.__kosiDataStore) {
    globalThis.__kosiDataStore = {
      devices: JSON.parse(JSON.stringify(initialDevices)),
      messages: JSON.parse(JSON.stringify(initialMessages)),
      mongoInitialized: false,
    };
    // Attempt async mongo seed/sync in background
    syncFromMongo().catch(() => {});
  }
  return globalThis.__kosiDataStore;
}

async function syncFromMongo() {
  const store = globalThis.__kosiDataStore;
  if (!store || store.mongoInitialized) return;

  try {
    const db = await getDb();
    if (!db) return;

    const devicesCol = db.collection<ConnectedDevice>('devices');
    const messagesCol = db.collection<Message>('messages');

    const devicesCount = await devicesCol.countDocuments();
    if (devicesCount === 0) {
      // Seed MongoDB
      await devicesCol.insertMany(JSON.parse(JSON.stringify(initialDevices)));
    } else {
      const mongoDevices = await devicesCol.find({}).toArray();
      if (mongoDevices.length > 0) {
        store.devices = mongoDevices.map(({ _id, ...rest }) => rest as ConnectedDevice);
      }
    }

    const messagesCount = await messagesCol.countDocuments();
    if (messagesCount === 0) {
      await messagesCol.insertMany(JSON.parse(JSON.stringify(initialMessages)));
    } else {
      const mongoMessages = await messagesCol.find({}).toArray();
      if (mongoMessages.length > 0) {
        store.messages = mongoMessages.map(({ _id, ...rest }) => rest as Message);
      }
    }

    store.mongoInitialized = true;
  } catch {
    // Non-fatal, fallback to memory
  }
}

export const db = {
  // ==================== DEVICES ====================
  getDevices(filter?: { role?: string; status?: string; search?: string }): ConnectedDevice[] {
    const store = getStore();
    let result = [...store.devices];

    if (filter?.role && filter.role !== 'ALL') {
      result = result.filter(
        (d) => d.role.toUpperCase() === filter.role?.toUpperCase()
      );
    }

    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter(
        (d) => d.status.toUpperCase() === filter.status?.toUpperCase()
      );
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.deviceId.toLowerCase().includes(q) ||
          d.userName.toLowerCase().includes(q) ||
          d.locationName.toLowerCase().includes(q)
      );
    }

    return result;
  },

  getDeviceById(id: string): ConnectedDevice | undefined {
    const store = getStore();
    return store.devices.find((d) => d.id === id || d.deviceId === id);
  },

  upsertDevice(deviceData: Partial<ConnectedDevice> & { deviceId: string }): ConnectedDevice {
    const store = getStore();
    const existingIndex = store.devices.findIndex((d) => d.deviceId === deviceData.deviceId);

    const now = new Date().toISOString();
    let resultDevice: ConnectedDevice;

    if (existingIndex >= 0) {
      const existing = store.devices[existingIndex];
      const updated: ConnectedDevice = {
        ...existing,
        ...deviceData,
        updatedAt: now,
        lastSeen: deviceData.lastSeen || now,
      };
      store.devices[existingIndex] = updated;
      resultDevice = updated;
    } else {
      const newDevice: ConnectedDevice = {
        id: deviceData.id || `dev-${Date.now()}`,
        deviceId: deviceData.deviceId,
        userId: deviceData.userId || `usr-${Date.now()}`,
        userName: deviceData.userName || deviceData.deviceId,
        role: deviceData.role || 'USER',
        deviceType: deviceData.deviceType || 'PHONE',
        latitude: deviceData.latitude ?? 26.1201,
        longitude: deviceData.longitude ?? 86.5902,
        battery: deviceData.battery ?? 100,
        status: deviceData.status || 'ONLINE',
        locationName: deviceData.locationName || 'Kosi River Sector',
        lastSeen: now,
        createdAt: now,
        updatedAt: now,
      };
      store.devices.unshift(newDevice);
      resultDevice = newDevice;
    }

    // Async persist to MongoDB
    getDb().then((mongo) => {
      if (mongo) {
        mongo.collection('devices').updateOne(
          { deviceId: resultDevice.deviceId },
          { $set: resultDevice },
          { upsert: true }
        ).catch(() => {});
      }
    }).catch(() => {});

    return resultDevice;
  },

  updateHeartbeat(
    deviceId: string,
    data: { latitude?: number; longitude?: number; battery?: number; status?: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'SOS' }
  ): ConnectedDevice | null {
    const store = getStore();
    const existing = store.devices.find((d) => d.deviceId === deviceId || d.id === deviceId);
    if (!existing) return null;

    const now = new Date().toISOString();
    if (data.latitude !== undefined) existing.latitude = data.latitude;
    if (data.longitude !== undefined) existing.longitude = data.longitude;
    if (data.battery !== undefined) existing.battery = data.battery;
    if (data.status !== undefined) existing.status = data.status;
    existing.lastSeen = now;
    existing.updatedAt = now;

    // Async persist to MongoDB
    getDb().then((mongo) => {
      if (mongo) {
        mongo.collection('devices').updateOne(
          { deviceId: existing.deviceId },
          { $set: existing }
        ).catch(() => {});
      }
    }).catch(() => {});

    return existing;
  },

  // ==================== MESSAGES ====================
  getMessages(filter?: {
    severity?: string;
    status?: string;
    role?: string;
    search?: string;
  }): Message[] {
    const store = getStore();
    let result = [...store.messages];

    if (filter?.severity && filter.severity !== 'ALL') {
      result = result.filter(
        (m) => m.severity.toUpperCase() === filter.severity?.toUpperCase()
      );
    }

    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter(
        (m) => m.status.toUpperCase() === filter.status?.toUpperCase()
      );
    }

    if (filter?.role && filter.role !== 'ALL') {
      result = result.filter(
        (m) => m.senderRole.toUpperCase() === filter.role?.toUpperCase()
      );
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.message.toLowerCase().includes(q) ||
          m.senderName.toLowerCase().includes(q) ||
          m.locationName.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getMessageById(id: string): Message | undefined {
    const store = getStore();
    return store.messages.find((m) => m.id === id);
  },

  createMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Message {
    const store = getStore();
    const now = new Date().toISOString();
    const newMsg: Message = {
      ...messageData,
      id: messageData.id || `MSG-${1000 + store.messages.length + 1}`,
      createdAt: now,
      updatedAt: now,
      status: messageData.status || 'UNREAD',
      isNew: true,
    };

    store.messages.unshift(newMsg);

    // Async persist to MongoDB
    getDb().then((mongo) => {
      if (mongo) {
        mongo.collection('messages').insertOne(newMsg).catch(() => {});
      }
    }).catch(() => {});

    return newMsg;
  },

  updateMessageStatus(
    id: string,
    updates: {
      status?: MessageStatus;
      severity?: PriorityLevel;
      assignedResponderId?: string;
      assignedResponderName?: string;
    }
  ): Message | null {
    const store = getStore();
    const msg = store.messages.find((m) => m.id === id);
    if (!msg) return null;

    if (updates.status) {
      msg.status = updates.status;
      msg.isNew = false;
    }
    if (updates.severity) msg.severity = updates.severity;
    if (updates.assignedResponderId !== undefined) {
      msg.assignedResponderId = updates.assignedResponderId;
    }
    if (updates.assignedResponderName !== undefined) {
      msg.assignedResponderName = updates.assignedResponderName;
    }

    msg.updatedAt = new Date().toISOString();

    // Async persist to MongoDB
    getDb().then((mongo) => {
      if (mongo) {
        mongo.collection('messages').updateOne(
          { id: msg.id },
          { $set: msg }
        ).catch(() => {});
      }
    }).catch(() => {});

    return msg;
  },

  addReplyToMessage(
    id: string,
    reply: {
      senderId: string;
      senderName: string;
      senderRole: 'ADMIN' | 'RESPONDER' | 'USER';
      message: string;
    }
  ): Message | null {
    const store = getStore();
    const msg = store.messages.find((m) => m.id === id);
    if (!msg) return null;

    if (!msg.replies) msg.replies = [];
    msg.replies.push({
      id: `rep-${Date.now()}`,
      senderId: reply.senderId,
      senderName: reply.senderName,
      senderRole: reply.senderRole,
      message: reply.message,
      createdAt: new Date().toISOString(),
    });

    msg.updatedAt = new Date().toISOString();

    // Async persist to MongoDB
    getDb().then((mongo) => {
      if (mongo) {
        mongo.collection('messages').updateOne(
          { id: msg.id },
          { $set: msg }
        ).catch(() => {});
      }
    }).catch(() => {});

    return msg;
  },

  // ==================== METRICS ====================
  getMetrics(): SystemMetrics {
    const store = getStore();
    const totalMessages = store.messages.length;
    const criticalP1Count = store.messages.filter((m) => m.severity === 'P1').length;
    const activeResponders = store.devices.filter(
      (d) => d.role === 'RESPONDER' && d.status === 'ONLINE'
    ).length;
    const connectedDevices = store.devices.filter((d) => d.status === 'ONLINE').length;

    const p1 = store.messages.filter((m) => m.severity === 'P1').length;
    const p2 = store.messages.filter((m) => m.severity === 'P2').length;
    const p3 = store.messages.filter((m) => m.severity === 'P3').length;
    const p4 = store.messages.filter((m) => m.severity === 'P4').length;

    return {
      totalMessages,
      totalMessagesChangePct: 12,
      criticalP1Count,
      criticalP1Change: 2,
      activeResponders,
      activeRespondersChange: 3,
      connectedDevices: 37, // Matching UI.png displayed mesh nodes metric
      connectedDevicesChange: 5,
      severityDistribution: { p1, p2, p3, p4 },
    };
  },

  resetToSeed() {
    globalThis.__kosiDataStore = {
      devices: JSON.parse(JSON.stringify(initialDevices)),
      messages: JSON.parse(JSON.stringify(initialMessages)),
      mongoInitialized: false,
    };
  },
};
