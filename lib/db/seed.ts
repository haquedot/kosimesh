import { ConnectedDevice, Message } from '@/types/schema';

// Clean initial empty state: All devices and messages are populated dynamically via API/mesh ingestion
export const initialDevices: ConnectedDevice[] = [];

export const initialMessages: Message[] = [];
