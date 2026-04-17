'use client';

import { useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isBefore, isSameDay, startOfMonth, startOfToday } from 'date-fns';
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
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const leadingEmpty = Array.from({ length: getDay(startOfMonth(month)) }, (_, index) => index);
  void business;

  return (
    <div>
      <h3 className="font-display text-[26px] font-semibold">Pick a date</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        {service.duration_minutes} min - {formatPrice(service.price, service.currency)}
      </p>
      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth((current) => addMonths(current, -1))}
          disabled={isSameDay(startOfMonth(month), startOfMonth(today))}
          className="rounded-xl border border-[var(--color-border)] p-2 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{format(month, 'MMMM yyyy')}</p>
        <button
          type="button"
          onClick={() => setMonth((current) => addMonths(current, 1))}
          className="rounded-xl border border-[var(--color-border)] p-2"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {weekdayOrder.map((day) => (
          <p key={day} className="text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            {day}
          </p>
        ))}
        {leadingEmpty.map((value) => (
          <div key={`empty-${value}`} />
        ))}
        {days.map((day) => {
          const iso = format(day, 'yyyy-MM-dd');
          const weekend = [0, 6].includes(day.getDay());
          const past = isBefore(day, today);
          const active = selected === iso;
          const disabled = weekend || past;
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => setSelected(iso)}
              className={`min-h-[78px] rounded-[14px] px-2 py-3 text-center transition ${
                active
                  ? 'bg-[var(--color-void)] text-white'
                  : disabled
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
        aria-disabled={!selected}
      >
        {selected ? `Continue - ${format(new Date(`${selected}T00:00:00`), 'EEE d MMM')}` : 'Select a date to continue'}
      </button>
    </div>
  );
}
