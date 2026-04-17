'use client';

import { addDays, format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { formatTimeLabel } from '@/lib/utils/formatting';
import type { BusinessProfile, DashboardBookingRecord } from '@/types';

const HOURS = Array.from({ length: 14 }, (_, index) => 7 + index);

function getHourInTimezone(value: string, timezone: string): number {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false
    }).format(new Date(value))
  );
}

function getDayKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function isSameDayInTimezone(value: string, day: Date, timezone: string): boolean {
  return getDayKey(new Date(value), timezone) === getDayKey(day, timezone);
}

export function MobileCalendar({
  business,
  bookings
}: {
  business: BusinessProfile;
  bookings: DashboardBookingRecord[];
}) {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const dayLabel = format(selectedDay, 'EEEE, MMMM d');
  const dayBookings = bookings.filter((booking) => isSameDayInTimezone(booking.start_time, selectedDay, business.timezone));

  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setSelectedDay((day) => addDays(day, -1))}
          aria-label="Previous day"
          className="rounded-xl border border-[var(--color-border)] p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <h2 className="flex-1 text-center text-sm font-semibold">{dayLabel}</h2>
        <button
          type="button"
          onClick={() => setSelectedDay((day) => addDays(day, 1))}
          aria-label="Next day"
          className="rounded-xl border border-[var(--color-border)] p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-1">
        {HOURS.map((hour) => {
          const booking = dayBookings.find((item) => getHourInTimezone(item.start_time, business.timezone) === hour);

          return (
            <div key={hour} className="grid grid-cols-[56px_1fr] gap-2">
              <span className="pt-3 text-right text-xs text-[var(--color-text-secondary)]">
                {formatTimeLabel(new Date(`2024-01-01T${String(hour).padStart(2, '0')}:00:00`), business.timezone)}
              </span>
              <div className="min-h-[52px] rounded-[14px] bg-[var(--color-surface-2)] p-2">
                {booking ? (
                  <div className="rounded-[10px] bg-[var(--color-void)] px-3 py-2 text-xs text-white">
                    <p className="font-semibold">{booking.customer_name}</p>
                    <p className="opacity-80">{booking.service?.name ?? 'Service'}</p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
