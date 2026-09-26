import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, userName, role, deviceType, latitude, longitude, battery, status, locationName } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      );
    }

    const device = db.upsertDevice({
      deviceId,
      userName: userName || deviceId,
      role: role || 'USER',
      deviceType: deviceType || 'PHONE',
      latitude: latitude ?? 26.1201,
      longitude: longitude ?? 86.5902,
      battery: battery ?? 100,
      status: status || 'ONLINE',
      locationName: locationName || 'Sector Alpha',
    });

    return NextResponse.json({ success: true, device }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
