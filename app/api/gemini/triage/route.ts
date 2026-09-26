import { NextRequest, NextResponse } from 'next/server';
import { analyzeEmergencyMessage } from '@/lib/gemini/triage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, senderName, senderRole, locationName, latitude, longitude } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'message text is required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeEmergencyMessage(message, {
      senderName,
      senderRole,
      locationName,
      latitude,
      longitude,
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
