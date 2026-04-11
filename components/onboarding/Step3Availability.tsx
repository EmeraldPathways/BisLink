import { demoAvailability } from '@/lib/demo-data';

export function Step3Availability() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 3 of 5</p>
        <h2 className="mt-2 font-display text-5xl">Your availability</h2>
      </div>
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, index) => {
        const record = demoAvailability.find((item) => item.day_of_week === index + 1);
        return (
          <div key={label} className="grid grid-cols-[80px_80px_1fr_1fr] items-center gap-3 rounded-[22px] border border-[var(--color-border)] bg-white px-4 py-4">
            <span className="font-semibold">{label}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${record ? 'bg-[var(--color-void)] text-white' : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'}`}>
              {record ? 'On' : 'Off'}
            </span>
            <span className="rounded-xl bg-[var(--color-surface-2)] px-3 py-2 text-sm">{record?.start_time.slice(0, 5) ?? 'Closed'}</span>
            <span className="rounded-xl bg-[var(--color-surface-2)] px-3 py-2 text-sm">{record?.end_time.slice(0, 5) ?? 'Closed'}</span>
          </div>
        );
      })}
    </div>
  );
}
