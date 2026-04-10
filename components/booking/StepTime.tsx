'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { demoAvailability, demoBlockedTimes, demoBookings } from '@/lib/demo-data';
import { calculateAvailableSlots } from '@/lib/utils/availability';
import { formatTimeLabel } from '@/lib/utils/formatting';
import type { BusinessProfile } from '@/types';
import type { Service } from './BookingPage';

export function StepTime({
  business,
  service,
  date,
  onNext
}: {
  business: BusinessProfile;
  service: Service;
  date: string;
  onBack: () => void;
  onNext: (time: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const slots = useMemo(() => {
    const availability = demoAvailability.find((entry) => entry.day_of_week === new Date(`${date}T00:00:00`).getDay()) ?? null;
    return calculateAvailableSlots(
      availability,
      service.duration_minutes,
      service.buffer_after,
      demoBookings
        .filter((booking) => booking.status !== 'cancelled')
        .map((booking) => ({ start_time: new Date(booking.start_time), end_time: new Date(booking.end_time) })),
      demoBlockedTimes.map((blocked) => ({ start_time: new Date(blocked.start_time), end_time: new Date(blocked.end_time) })),
      new Date(`${date}T00:00:00`),
      business.timezone
    );
  }, [business.timezone, date, service.buffer_after, service.duration_minutes]);

  return (
    <div>
      <h3 className="font-display text-[26px] font-semibold">Choose a time</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        {format(new Date(`${date}T00:00:00`), 'EEE, d MMM')} · {service.duration_minutes} min
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {slots.map((slot) => {
          const active = selected === slot;
          return (
            <button
              key={slot}
              onClick={() => setSelected(slot)}
              className={`rounded-xl border px-3 py-3 text-sm font-medium ${
                active
                  ? 'border-[var(--color-void)] bg-[var(--color-void)] text-white'
                  : 'border-[#e8e8e8] bg-white text-[var(--color-text-primary)]'
              }`}
            >
              {formatTimeLabel(new Date(`${date}T${slot}:00`), business.timezone)}
            </button>
          );
        })}
      </div>
      <button
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
        className="mt-6 w-full rounded-2xl bg-[var(--color-void)] px-4 py-4 text-sm font-semibold text-white disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-tertiary)]"
      >
        {selected
          ? `Continue — ${formatTimeLabel(new Date(`${date}T${selected}:00`), business.timezone)}`
          : 'Select a time to continue'}
      </button>
    </div>
  );
}
