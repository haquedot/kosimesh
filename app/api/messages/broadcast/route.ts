import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, severity = 'P1', locationName = 'All Kosi Sectors' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'message text is required' },
        { status: 400 }
      );
    }

    const broadcastMsg = db.createMessage({
      senderId: 'ADMIN-HQ',
      senderName: 'Incident Commander (HQ)',
      senderRole: 'ADMIN',
      message: `[EMERGENCY BROADCAST]: ${message}`,
      messageType: 'DISPATCH',
      locationName,
      severity,
      severityReason: 'Commander initiated mesh-wide alert broadcast.',
      status: 'ACKNOWLEDGED',
    });

    return NextResponse.json({ success: true, message: broadcastMsg }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
