import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { analyzeEmergencyMessage } from '@/lib/gemini/triage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get('severity') || undefined;
    const status = searchParams.get('status') || undefined;
    const role = searchParams.get('role') || undefined;
    const search = searchParams.get('search') || undefined;

    const messages = db.getMessages({ severity, status, role, search });
    return NextResponse.json({ messages, total: messages.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      senderId,
      senderName,
      senderRole = 'USER',
      message,
      messageType = 'SOS',
      latitude,
      longitude,
      locationName = 'Sector Alpha',
      severity: initialSeverity,
      severityReason: initialReason,
      geminiAnalysis: initialAnalysis,
    } = body;

    if (!message || !senderId) {
      return NextResponse.json(
        { error: 'senderId and message are required' },
        { status: 400 }
      );
    }

    // Run automated Gemini AI triage if analysis is not explicitly provided
    let finalAnalysis = initialAnalysis;
    let finalSeverity = initialSeverity;
    let finalReason = initialReason;

    if (!finalAnalysis) {
      finalAnalysis = await analyzeEmergencyMessage(message, {
        senderName: senderName || senderId,
        senderRole,
        locationName,
        latitude,
        longitude,
      });
      finalSeverity = finalAnalysis.severity;
      finalReason = finalAnalysis.reason;
    }

    const newMessage = db.createMessage({
      senderId,
      senderName: senderName || senderId,
      senderRole,
      message,
      messageType,
      latitude,
      longitude,
      locationName,
      severity: finalSeverity || 'P1',
      severityReason: finalReason || 'Analyzed by AI Triage.',
      geminiAnalysis: finalAnalysis,
      status: 'UNREAD',
    });

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
