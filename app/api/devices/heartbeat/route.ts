import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, latitude, longitude, battery, status } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      );
    }

    const device = db.updateHeartbeat(deviceId, {
      latitude,
      longitude,
      battery,
      status,
    });

    if (!device) {
      // Auto-register if heartbeat arrives for an unregistered device
      const autoRegistered = db.upsertDevice({
        deviceId,
        latitude,
        longitude,
        battery,
        status: status || 'ONLINE',
      });
      return NextResponse.json({ success: true, device: autoRegistered, autoRegistered: true });
    }

    return NextResponse.json({ success: true, device });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
