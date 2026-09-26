import { db } from '@/lib/db/store';
import { CommandDashboard } from '@/components/dashboard/CommandDashboard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialDevices = db.getDevices();
  const initialMessages = db.getMessages();
  const initialMetrics = db.getMetrics();

  return (
    <CommandDashboard
      initialDevices={initialDevices}
      initialMessages={initialMessages}
      initialMetrics={initialMetrics}
    />
  );
}
