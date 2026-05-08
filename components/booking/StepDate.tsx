'use client';

import { useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfToday,
  startOfWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const weekdayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [selected, setSelected] = useState<string | null>(null);
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const today = startOfToday();
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 0 })
  });
  void business;

  return (
    <div className="mx-auto w-full max-w-[360px]">
      <h3 className="text-center font-display text-[22px]">Pick a date</h3>
      <p className="mt-1 text-center text-[13px] text-[var(--color-text-secondary)]">
        {service.duration_minutes} min - {formatPrice(service.price, service.currency)}
      </p>
      <div className="mt-5">
        <div className="grid grid-cols-[48px_1fr_48px] items-center gap-4">
          <button
            type="button"
            onClick={() => setMonth((current) => addMonths(current, -1))}
            disabled={isSameDay(monthStart, startOfMonth(today))}
            className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[var(--color-border)] bg-[var(--page-surface)] shadow-[0_10px_24px_rgba(45,25,7,0.05)] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="text-center font-display text-[28px] text-[var(--color-text-primary)]">{format(month, 'MMMM yyyy')}</p>
          <button
            type="button"
            onClick={() => setMonth((current) => addMonths(current, 1))}
            className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[var(--color-border)] bg-[var(--page-surface)] shadow-[0_10px_24px_rgba(45,25,7,0.05)]"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-7 grid grid-cols-7 gap-x-3 gap-y-4">
          {weekdayOrder.map((day) => (
            <p key={day} className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              {day}
            </p>
          ))}

          {calendarDays.map((day) => {
            const iso = format(day, 'yyyy-MM-dd');
            const inCurrentMonth = isSameMonth(day, month);
            const weekend = [0, 6].includes(day.getDay());
            const past = isBefore(day, today);
            const active = selected === iso;
            const disabled = !inCurrentMonth || weekend || past;

            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                onClick={() => setSelected(iso)}
                className={`min-h-[84px] rounded-[20px] px-2 py-3 text-center transition ${
                  active
                    ? 'bg-[var(--color-void)] text-white shadow-[0_18px_24px_rgba(16,12,9,0.18)]'
                    : disabled
                      ? 'cursor-default bg-[var(--page-surface)] text-[var(--color-text-secondary)] opacity-35'
                      : 'bg-[var(--page-surface)] shadow-[0_10px_20px_rgba(45,25,7,0.04)]'
                }`}
              >
                <p className="text-[18px] font-semibold leading-none">{format(day, 'd')}</p>
                <p
                  className={`mt-3 text-[11px] uppercase tracking-[0.14em] ${
                    active ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {format(day, 'MMM')}
                </p>
              </button>
            );
          })}
        </div>
      </div>
      <button
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
        className="mt-6 w-full rounded-[18px] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-4 py-4 text-sm font-semibold text-white disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-tertiary)]"
        aria-disabled={!selected}
      >
        {selected ? `Continue - ${format(new Date(`${selected}T00:00:00`), 'EEE d MMM')}` : 'Select a date to continue'}
      </button>
    </div>
  );
}
