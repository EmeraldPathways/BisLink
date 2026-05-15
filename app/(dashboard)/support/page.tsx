import { SupportInbox } from '@/components/dashboard/SupportInbox';
import { getSupportData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { tickets, counts, statuses } = await getSupportData();

  return <SupportInbox tickets={tickets} counts={counts} statuses={statuses} />;
}
