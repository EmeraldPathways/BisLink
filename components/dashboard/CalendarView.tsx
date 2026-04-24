'use client';

import { addDays, startOfWeek } from 'date-fns';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { formatTimeLabel } from '@/lib/utils/formatting';
import type { BusinessProfile, DashboardBookingRecord } from '@/types';
import { MobileCalendar } from './MobileCalendar';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 14 }, (_, index) => 7 + index);

export function CalendarView({
  business,
  bookings,
}: {
  business: BusinessProfile;
  bookings: DashboardBookingRecord[];
}) {
  const isMobile = useIsMobile();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index),
  );

  if (isMobile) {
    return <MobileCalendar business={business} bookings={bookings} />;
  }

  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-4xl">Weekly calendar</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Mon-Sun with hourly booking blocks.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled
            className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            disabled
            className="rounded-xl bg-[var(--color-surface-3)] px-3 py-2 text-sm opacity-60"
          >
            Today
          </button>
          <button
            type="button"
            disabled
            className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm opacity-60"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] gap-2">
        <div />
        {days.map((day) => (
          <div
            key={day}
            className="pb-2 text-center text-sm font-semibold text-[var(--color-text-secondary)]"
          >
            {day}
          </div>
        ))}
        {hours.map((hour) => (
          <FragmentRow
            key={hour}
            hour={hour}
            business={business}
            bookings={bookings}
            weekDays={weekDays}
          />
        ))}
      </div>
    </div>
  );
}

function FragmentRow({
  hour,
  business,
  bookings,
  weekDays,
}: {
  hour: number;
  business: BusinessProfile;
  bookings: DashboardBookingRecord[];
  weekDays: Date[];
}) {
  return (
    <>
      <div className="pt-4 text-sm text-[var(--color-text-secondary)]">
        {formatTimeLabel(
          new Date(`2024-01-01T${String(hour).padStart(2, '0')}:00:00`),
          business.timezone,
        )}
      </div>
      {weekDays.map((day) => {
        const booking = bookings.find(
          (item) =>
            isSameBusinessDay(item.start_time, day, business.timezone) &&
            getHourInTimezone(item.start_time, business.timezone) === hour,
        );
        return (
          <div
            key={`${hour}-${day.toISOString()}`}
            className="min-h-[72px] rounded-[18px] bg-[var(--color-surface-2)] p-2"
          >
            {booking ? (
              <div
                className={`rounded-[14px] px-2 py-2 text-xs ${colorForStatus(booking.status)}`}
              >
                <p className="font-semibold">{booking.customer_name}</p>
                <p>{booking.service?.name ?? 'Service unavailable'}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function isSameBusinessDay(value: string, day: Date, timezone: string) {
  return getDayKey(new Date(value), timezone) === getDayKey(day, timezone);
}

function getDayKey(date: Date, timezone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getHourInTimezone(value: string, timezone: string) {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false,
    }).format(new Date(value)),
  );
}

function colorForStatus(status: DashboardBookingRecord['status']) {
  if (status === 'completed')
    return 'bg-[var(--color-success)]/20 text-[var(--color-text-primary)]';
  if (status === 'cancelled')
    return 'bg-slate-200 text-[var(--color-text-primary)]';
  return 'bg-[var(--color-void)] text-white';
}
