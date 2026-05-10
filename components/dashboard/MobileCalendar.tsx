'use client';

import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useState } from 'react';
import type {
  AvailabilityRecord,
  BusinessProfile,
  DashboardBookingRecord,
} from '@/types';
import {
  formatDayKey,
  getBusinessTodayKey,
  getHourInTimezone,
  isSameBusinessDay,
  shiftDayKey,
} from './calendar-date';
import { deriveCalendarHours, formatCalendarHourLabel } from './calendar-hours';

function colorForStatus(status: DashboardBookingRecord['status']) {
  if (status === 'completed') return 'border-l-green-500 bg-green-50/50';
  if (status === 'cancelled') return 'border-l-[var(--color-text-tertiary)] bg-[var(--color-surface-3)]';
  return 'border-l-[var(--color-gold)] bg-[var(--calendar-booking-bg)]';
}

export function MobileCalendar({
  business,
  bookings,
  availability,
}: {
  business: BusinessProfile;
  bookings: DashboardBookingRecord[];
  availability: AvailabilityRecord[];
}) {
  const [selectedDayKey, setSelectedDayKey] = useState(() => getBusinessTodayKey(business.timezone));
  const todayKey = getBusinessTodayKey(business.timezone);
  const isToday = selectedDayKey === todayKey;
  const dayLabel = formatDayKey(selectedDayKey, { weekday: 'long', month: 'long', day: 'numeric' });
  const dayBookings = bookings.filter((booking) =>
    isSameBusinessDay(booking.start_time, selectedDayKey, business.timezone)
  );
  const hours = deriveCalendarHours(availability);

  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-4 md:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setSelectedDayKey((dayKey) => shiftDayKey(dayKey, -1))}
          aria-label="Previous day"
          className="touch-target flex items-center justify-center rounded-xl border border-[var(--color-border)] transition-colors active:bg-[var(--color-surface-2)]"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex flex-1 flex-col items-center">
          <h2 className="text-base font-semibold md:text-lg">{dayLabel}</h2>
          {isToday && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--color-gold-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-gold-dark)]">
              Today
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSelectedDayKey((dayKey) => shiftDayKey(dayKey, 1))}
          aria-label="Next day"
          className="touch-target flex items-center justify-center rounded-xl border border-[var(--color-border)] transition-colors active:bg-[var(--color-surface-2)]"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-1.5">
        {hours.map((hour) => {
          const booking = dayBookings.find(
            (item) => getHourInTimezone(item.start_time, business.timezone) === hour
          );

          return (
            <div key={hour} className="grid grid-cols-[52px_1fr] gap-2 md:grid-cols-[60px_1fr]">
              <span className="pt-3 text-right text-xs text-[var(--color-text-secondary)]">
                {formatCalendarHourLabel(hour)}
              </span>
              <div
                className={`min-h-[56px] rounded-[14px] p-2 ${
                  booking ? '' : 'border border-transparent bg-[var(--color-surface-3)]'
                }`}
              >
                {booking ? (
                  <div
                    className={`rounded-[10px] border-l-[3px] px-3 py-2.5 text-xs ${colorForStatus(booking.status)}`}
                  >
                    <p className="font-semibold text-[var(--color-text-primary)]">
                      {booking.customer_name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[var(--color-text-secondary)]">
                      <Clock className="h-3 w-3" />
                      {booking.service?.name ?? 'Service'}
                    </p>
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
