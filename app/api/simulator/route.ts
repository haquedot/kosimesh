import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { advanceSimulationTick, triggerFlashFloodScenario, triggerLowFuelScenario } from '@/lib/simulator/scenarios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({ action: 'tick' }));
    const { action } = body;

    switch (action) {
      case 'tick': {
        const result = await advanceSimulationTick();
        return NextResponse.json({ success: true, action: 'tick', result });
      }

      case 'flash_flood': {
        const message = await triggerFlashFloodScenario();
        return NextResponse.json({ success: true, action: 'flash_flood', message });
      }

      case 'low_fuel': {
        const message = await triggerLowFuelScenario();
        return NextResponse.json({ success: true, action: 'low_fuel', message });
      }

      case 'reset': {
        db.resetToSeed();
        return NextResponse.json({ success: true, action: 'reset' });
      }

      default:
        return NextResponse.json({ error: 'Unknown simulation action' }, { status: 400 });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
