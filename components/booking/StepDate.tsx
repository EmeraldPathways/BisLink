'use client';

import { useState } from 'react';
import {
  addDays,
  format,
  startOfToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BusinessProfile } from '@/types';
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
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const today = startOfToday();
  const availableDates = Array.from({ length: 60 })
    .map((_, index) => addDays(today, index))
    .filter((day) => ![0, 6].includes(day.getDay()));
  const pageSize = 8;
  const maxPage = Math.max(Math.ceil(availableDates.length / pageSize) - 1, 0);
  const visibleDates = availableDates.slice(page * pageSize, (page + 1) * pageSize);
  const firstVisibleDate = visibleDates[0];
  const lastVisibleDate = visibleDates[visibleDates.length - 1];
  const pageLabel =
    firstVisibleDate && lastVisibleDate
      ? `${format(firstVisibleDate, 'd MMM')} - ${format(lastVisibleDate, 'd MMM')}`
      : 'No dates';
  void business;
  void service;

  return (
      <div className="mx-auto w-full max-w-[360px]">
      <div className="mt-2">
        <div className="grid grid-cols-[48px_1fr_48px] items-center gap-4">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={page === 0}
            className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[var(--color-border)] bg-[var(--page-surface)] shadow-[0_10px_24px_rgba(45,25,7,0.05)] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="text-center">
            <p className="font-display text-[24px] text-[var(--color-text-primary)]">Available dates</p>
            <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{pageLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(current + 1, maxPage))}
            disabled={page === maxPage}
            className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[var(--color-border)] bg-[var(--page-surface)] shadow-[0_10px_24px_rgba(45,25,7,0.05)]"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {visibleDates.map((day) => {
            const iso = format(day, 'yyyy-MM-dd');
            const active = selected === iso;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelected(iso)}
                className={`min-h-[76px] rounded-[18px] px-2 py-2.5 text-center transition ${
                  active
                    ? 'bg-[var(--color-void)] text-white shadow-[0_18px_24px_rgba(16,12,9,0.18)]'
                    : 'bg-[var(--page-surface)] shadow-[0_10px_20px_rgba(45,25,7,0.04)]'
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                  {format(day, 'EEE')}
                </p>
                <p
                  className={`mt-2 font-display text-[22px] leading-none ${
                    active ? 'text-white' : 'text-[var(--color-text-primary)]'
                  }`}
                >
                  {format(day, 'd')}
                </p>
                <p
                  className={`mt-2 text-[11px] uppercase tracking-[0.14em] ${
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
