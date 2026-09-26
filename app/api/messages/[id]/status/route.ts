import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, severity, assignedResponderId, assignedResponderName } = body;

    const updated = db.updateMessageStatus(id, {
      status,
      severity,
      assignedResponderId,
      assignedResponderName,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
