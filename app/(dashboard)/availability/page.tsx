import { AvailabilityGrid } from '@/components/dashboard/AvailabilityGrid';
import { getAvailabilityData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { availability, blockedTimes, business } = await getAvailabilityData();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-5xl">Availability</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Set working hours and block off time without leaving the app.</p>
      </div>
      <AvailabilityGrid availability={availability} blockedTimes={blockedTimes} timezone={business.timezone} />
    </div>
  );
}
