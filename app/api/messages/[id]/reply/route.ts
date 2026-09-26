import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { message: replyMessage, senderName = 'Admin Command Center', senderRole = 'ADMIN', senderId = 'ADMIN' } = body;

    if (!replyMessage || typeof replyMessage !== 'string') {
      return NextResponse.json(
        { error: 'replyMessage text is required' },
        { status: 400 }
      );
    }

    const updated = db.addReplyToMessage(id, {
      senderId,
      senderName,
      senderRole,
      message: replyMessage,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Also transition status to IN_PROGRESS if currently UNREAD or ACKNOWLEDGED
    if (updated.status === 'UNREAD' || updated.status === 'ACKNOWLEDGED') {
      db.updateMessageStatus(id, { status: 'IN_PROGRESS' });
    }

    return NextResponse.json({ success: true, message: updated }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
