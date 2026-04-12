'use client';

import { useState } from 'react';
import { addDays, format } from 'date-fns';
import type { BusinessProfile } from '@/types';
import { formatPrice } from '@/lib/utils/formatting';
import type { Service } from './BookingPage';

export function StepDate({
  business,
  service,
  onNext
}: {
  business: BusinessProfile;
  service: Service;
  onNext: (date: string) => void;
}) {
  const days = Array.from({ length: 21 }, (_, index) => addDays(new Date(), index));
  const weekdayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [selected, setSelected] = useState<string | null>(null);
  void business;

  return (
    <div>
      <h3 className="font-display text-[26px] font-semibold">Pick a date</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        {service.duration_minutes} min - {formatPrice(service.price, service.currency)}
      </p>
      <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {days.map((day) => {
          const iso = format(day, 'yyyy-MM-dd');
          const weekend = [0, 6].includes(day.getDay());
          const active = selected === iso;
          return (
            <button
              key={iso}
              disabled={weekend}
              onClick={() => setSelected(iso)}
              className={`min-h-[78px] rounded-[14px] px-2 py-3 text-center transition ${
                active
                  ? 'bg-[var(--color-void)] text-white'
                  : weekend
                    ? 'cursor-default bg-[#f6f6f4] opacity-35'
                    : 'bg-[var(--color-surface-3)]'
              }`}
            >
              <p className={`text-[9px] uppercase ${active ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-secondary)]'}`}>
                {weekdayOrder[day.getDay()]}
              </p>
              <p className="mt-1 text-[15px] font-semibold">{format(day, 'd')}</p>
              <p className={`text-[9px] uppercase ${active ? 'text-white/80' : 'text-[var(--color-text-secondary)]'}`}>
                {format(day, 'MMM')}
              </p>
            </button>
          );
        })}
      </div>
      <button
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
        className="mt-6 w-full rounded-2xl bg-[var(--color-void)] px-4 py-4 text-sm font-semibold text-white disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-tertiary)]"
      >
        {selected ? `Continue - ${format(new Date(`${selected}T00:00:00`), 'EEE d MMM')}` : 'Select a date to continue'}
      </button>
    </div>
  );
}
