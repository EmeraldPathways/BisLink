'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateTimeLabel } from '@/lib/utils/formatting';
import type { AvailabilityRecord, BlockedTimeRecord } from '@/types';

const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayState = {
  is_active: boolean;
  start_time: string;
  end_time: string;
};

export function AvailabilityGrid({
  availability,
  blockedTimes,
  timezone
}: {
  availability: AvailabilityRecord[];
  blockedTimes: BlockedTimeRecord[];
  timezone: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [blockedForm, setBlockedForm] = useState({ date: '', start: '', end: '', reason: '' });
  const [days, setDays] = useState<Record<number, DayState>>(() => buildDayState(availability));

  useEffect(() => {
    setDays(buildDayState(availability));
  }, [availability]);

  function updateDay(day: number, patch: Partial<DayState>) {
    setDays((current) => ({ ...current, [day]: { ...current[day], ...patch } }));
  }

  async function saveDay(day: number) {
    setError(null);
    const state = days[day];
    const res = await fetch('/api/owner/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_of_week: day,
        is_active: state.is_active,
        start_time: state.start_time,
        end_time: state.end_time
      })
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Failed to save availability');
      return;
    }

    startTransition(() => router.refresh());
  }

  async function addBlockedTime() {
    setError(null);
    const start_time = new Date(`${blockedForm.date}T${blockedForm.start}:00`).toISOString();
    const end_time = new Date(`${blockedForm.date}T${blockedForm.end}:00`).toISOString();

    const res = await fetch('/api/owner/blocked-times', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_time,
        end_time,
        reason: blockedForm.reason
      })
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Failed to add blocked time');
      return;
    }

    setBlockedForm({ date: '', start: '', end: '', reason: '' });
    startTransition(() => router.refresh());
  }

  async function deleteBlockedTime(id: string) {
    setError(null);
    const res = await fetch(`/api/owner/blocked-times/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Failed to delete blocked time');
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
        <h2 className="font-display text-4xl">Working hours</h2>
        <div className="mt-5 space-y-3">
          {labels.map((label, index) => {
            const record = days[index];
            return (
              <div key={label} className="grid grid-cols-[70px_72px_1fr_1fr_72px] items-center gap-3 rounded-[18px] bg-[var(--color-surface-2)] px-4 py-4">
                <span className="text-sm font-semibold">{label}</span>
                <button
                  type="button"
                  onClick={() => updateDay(index, { is_active: !record.is_active })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${record.is_active ? 'bg-[var(--color-void)] text-white' : 'bg-white text-[var(--color-text-secondary)]'}`}
                >
                  {record.is_active ? 'On' : 'Off'}
                </button>
                <input type="time" value={record.start_time} disabled={!record.is_active} onChange={(event) => updateDay(index, { start_time: event.target.value })} className="rounded-xl bg-white px-3 py-2 text-sm disabled:opacity-50" />
                <input type="time" value={record.end_time} disabled={!record.is_active} onChange={(event) => updateDay(index, { end_time: event.target.value })} className="rounded-xl bg-white px-3 py-2 text-sm disabled:opacity-50" />
                <button
                  onClick={() => saveDay(index)}
                  disabled={isPending}
                  className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs font-medium disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
                >
                  {isPending ? '…' : 'Save'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
        <h2 className="font-display text-4xl">Block time off</h2>
        <div className="mt-5 space-y-3">
          <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" type="date" value={blockedForm.date} onChange={(event) => setBlockedForm((current) => ({ ...current, date: event.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" type="time" value={blockedForm.start} onChange={(event) => setBlockedForm((current) => ({ ...current, start: event.target.value }))} />
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" type="time" value={blockedForm.end} onChange={(event) => setBlockedForm((current) => ({ ...current, end: event.target.value }))} />
          </div>
          <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Reason" value={blockedForm.reason} onChange={(event) => setBlockedForm((current) => ({ ...current, reason: event.target.value }))} />
          <button onClick={addBlockedTime} disabled={isPending} className="w-full rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
            Add blocked time
          </button>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
        <div className="mt-6 space-y-3">
          {blockedTimes.map((blocked) => (
            <div key={blocked.id} className="rounded-[18px] bg-[var(--color-surface-2)] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{blocked.reason ?? 'Blocked'}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {formatDateTimeLabel(blocked.start_time, timezone)} to {formatDateTimeLabel(blocked.end_time, timezone)}
                  </p>
                </div>
                <button onClick={() => deleteBlockedTime(blocked.id)} disabled={isPending} className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs font-medium disabled:opacity-60">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildDayState(availability: AvailabilityRecord[]) {
  return Object.fromEntries(
    Array.from({ length: 7 }, (_, index) => {
      const record = availability.find((item) => item.day_of_week === index);
      return [
        index,
        {
          is_active: record?.is_active ?? false,
          start_time: record?.start_time.slice(0, 5) ?? '09:00',
          end_time: record?.end_time.slice(0, 5) ?? '17:00'
        }
      ];
    })
  ) as Record<number, DayState>;
}
