import { ActivationNudgeCard } from '@/components/support/ActivationNudgeCard';
import { SupportInbox } from '@/components/dashboard/SupportInbox';
import { getSupportAssistantData, getSupportData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [{ tickets, counts, statuses }, { activationStatus }] = await Promise.all([
    getSupportData(),
    getSupportAssistantData()
  ]);

  return (
    <div className="space-y-5">
      <ActivationNudgeCard activationStatus={activationStatus} />
      <SupportInbox tickets={tickets} counts={counts} statuses={statuses} />
    </div>
  );
}
