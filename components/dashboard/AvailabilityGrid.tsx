import { formatDateTimeLabel } from '@/lib/utils/formatting';
import type { AvailabilityRecord, BlockedTimeRecord } from '@/types';

const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AvailabilityGrid({
  availability,
  blockedTimes,
  timezone
}: {
  availability: AvailabilityRecord[];
  blockedTimes: BlockedTimeRecord[];
  timezone: string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
        <h2 className="font-display text-4xl">Working hours</h2>
        <div className="mt-5 space-y-3">
          {labels.map((label, index) => {
            const record = availability.find((item) => item.day_of_week === index);
            return (
              <div key={label} className="grid grid-cols-[80px_80px_1fr_1fr] items-center gap-3 rounded-[18px] bg-[var(--color-surface-2)] px-4 py-4">
                <span className="text-sm font-semibold">{label}</span>
                <button disabled className={`rounded-full px-3 py-1 text-xs font-semibold opacity-70 ${record ? 'bg-[var(--color-void)] text-white' : 'bg-white text-[var(--color-text-secondary)]'}`}>
                  {record ? 'On' : 'Off'}
                </button>
                <div className="rounded-xl bg-white px-3 py-2 text-sm">{record?.start_time.slice(0, 5) ?? 'Closed'}</div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm">{record?.end_time.slice(0, 5) ?? 'Closed'}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
        <h2 className="font-display text-4xl">Block time off</h2>
        <div className="mt-5 space-y-3">
          <input disabled className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" type="date" />
          <div className="grid grid-cols-2 gap-3">
            <input disabled className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" type="time" />
            <input disabled className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" type="time" />
          </div>
          <input disabled className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" placeholder="Reason" />
          <button disabled className="w-full rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white opacity-60">
            Add blocked time
          </button>
          <p className="text-xs text-[var(--color-text-secondary)]">Availability editing moves to live actions in Phase 2.</p>
        </div>
        <div className="mt-6 space-y-3">
          {blockedTimes.map((blocked) => (
            <div key={blocked.id} className="rounded-[18px] bg-[var(--color-surface-2)] px-4 py-4">
              <p className="text-sm font-semibold">{blocked.reason ?? 'Blocked'}</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {formatDateTimeLabel(blocked.start_time, timezone)} to {formatDateTimeLabel(blocked.end_time, timezone)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
