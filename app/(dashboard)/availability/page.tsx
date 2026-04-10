import { AvailabilityGrid } from '@/components/dashboard/AvailabilityGrid';
import { demoAvailability, demoBlockedTimes } from '@/lib/demo-data';

export default function Page() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-5xl">Availability</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Set working hours and block off time without leaving the app.</p>
      </div>
      <AvailabilityGrid availability={demoAvailability} blockedTimes={demoBlockedTimes} />
    </div>
  );
}
