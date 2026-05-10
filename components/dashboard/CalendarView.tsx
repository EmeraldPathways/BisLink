'use client';

import { useIsMobile } from '@/hooks/useBreakpoint';
import type {
  AvailabilityRecord,
  BusinessProfile,
  DashboardBookingRecord,
} from '@/types';
import {
  formatDayKey,
  getBusinessTodayKey,
  getHourInTimezone,
  getStartOfWeekKey,
  isSameBusinessDay,
  shiftDayKey,
} from './calendar-date';
import { deriveCalendarHours, formatCalendarHourLabel } from './calendar-hours';
import { MobileCalendar } from './MobileCalendar';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function colorForStatus(status: DashboardBookingRecord['status']) {
  if (status === 'completed') return 'border-l-green-500 bg-green-50/50';
  if (status === 'cancelled') return 'border-l-[var(--color-text-tertiary)] bg-[var(--color-surface-3)]';
  return 'border-l-[var(--color-gold)] bg-[var(--calendar-booking-bg)]';
}

export function CalendarView({
  business,
  bookings,
  availability,
}: {
  business: BusinessProfile;
  bookings: DashboardBookingRecord[];
  availability: AvailabilityRecord[];
}) {
  const isMobile = useIsMobile();
  const todayKey = getBusinessTodayKey(business.timezone);
  const weekStartKey = getStartOfWeekKey(todayKey);
  const weekDays = Array.from({ length: 7 }, (_, index) => shiftDayKey(weekStartKey, index));
  const weekEndKey = weekDays[6]!;
  const weekRange = `${formatDayKey(weekStartKey, { month: 'short', day: 'numeric' })} â€” ${formatDayKey(weekEndKey, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const hours = deriveCalendarHours(availability);

  if (isMobile) {
    return (
      <MobileCalendar
        business={business}
        bookings={bookings}
        availability={availability}
      />
    );
  }

  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-4xl">Weekly calendar</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {weekRange}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled
            className="btn-secondary text-sm opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            disabled
            className="btn-primary text-sm opacity-60"
          >
            Today
          </button>
          <button
            type="button"
            disabled
            className="btn-secondary text-sm opacity-60"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] gap-2">
        <div />
        {days.map((day, index) => {
          const dayKey = weekDays[index]!;
          const isToday = dayKey === todayKey;
          return (
            <div
              key={day}
              className={`pb-2 text-center ${isToday ? 'rounded-t-lg bg-[var(--calendar-today-column)] pt-2' : ''}`}
            >
              <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{day}</p>
              <p className={`mt-0.5 text-xs ${isToday ? 'font-semibold text-[var(--color-gold-dark)]' : 'text-[var(--color-text-tertiary)]'}`}>
                {formatDayKey(dayKey, { day: 'numeric' })}
              </p>
            </div>
          );
        })}
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
  weekDays: string[];
}) {
  return (
    <>
      <div className="pt-4 text-right text-xs text-[var(--color-text-secondary)]">
        {formatCalendarHourLabel(hour)}
      </div>
      {weekDays.map((day) => {
        const booking = bookings.find(
          (item) =>
            isSameBusinessDay(item.start_time, day, business.timezone) &&
            getHourInTimezone(item.start_time, business.timezone) === hour,
        );
        const isToday = day === getBusinessTodayKey(business.timezone);
        return (
          <div
            key={`${hour}-${day}`}
            className={`min-h-[72px] rounded-[18px] p-2 ${
              booking
                ? ''
                : isToday
                  ? 'calendar-slot-today'
                  : 'bg-[var(--color-surface-3)]'
            }`}
          >
            {booking ? (
              <div
                className={`rounded-[14px] border-l-[3px] px-2 py-2 text-xs ${colorForStatus(booking.status)}`}
              >
                <p className="font-semibold text-[var(--color-text-primary)]">{booking.customer_name}</p>
                <p className="mt-0.5 text-[var(--color-text-secondary)]">{booking.service?.name ?? 'Service unavailable'}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
