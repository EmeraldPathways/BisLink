import { CalendarCheck, CalendarX, Clock } from 'lucide-react';
import { formatPrice, formatTimeLabel } from '@/lib/utils/formatting';
import type { BookingRecord, BusinessProfile, ServiceRecord } from '@/types';

export function BookingCard({
  booking,
  business,
  service,
}: {
  booking: BookingRecord;
  business: BusinessProfile;
  service: ServiceRecord | null;
}) {
  const bookingStatus = getBookingProcessingStatus(booking, business);

  const statusConfig = {
    confirmed: {
      border: 'border-l-[var(--color-gold)]',
      badgeBg: 'bg-[var(--color-gold-muted)]',
      badgeText: 'text-[var(--color-gold-dark)]',
      icon: Clock,
    },
    completed: {
      border: 'border-l-green-500',
      badgeBg: 'bg-green-50',
      badgeText: 'text-green-700',
      icon: CalendarCheck,
    },
    cancelled: {
      border: 'border-l-[var(--color-text-tertiary)]',
      badgeBg: 'bg-[var(--color-surface-3)]',
      badgeText: 'text-[var(--color-text-secondary)]',
      icon: CalendarX,
    },
  };

  const status = booking.status as keyof typeof statusConfig;
  const config = statusConfig[status] ?? statusConfig.confirmed;
  const StatusIcon = config.icon;

  const initials = booking.customer_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`rounded-[22px] border border-[var(--color-border)] border-l-[3px] bg-white p-4 shadow-card md:p-5 ${config.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-xs font-semibold text-[var(--color-text-secondary)] md:h-10 md:w-10">
            {initials}
          </div>
          <div>
            <p className="text-base font-semibold md:text-lg">
              {formatTimeLabel(booking.start_time, business.timezone)}
            </p>
            <p className="mt-0.5 text-sm text-[var(--color-text-primary)]">
              {booking.customer_name}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {service?.name ?? 'Service unavailable'}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${config.badgeBg} ${config.badgeText}`}>
            <StatusIcon className="h-3 w-3" />
            {booking.status}
          </span>
          <p className="mt-2 text-[11px] font-medium text-[var(--color-text-secondary)]">
            {bookingStatus}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--color-text-secondary)] md:flex-row md:items-center md:justify-between">
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 opacity-50" />
          {service?.duration_minutes ?? 0} min ·{' '}
          {formatPrice(
            service?.price ?? booking.amount_paid,
            service?.currency ?? booking.currency,
          )}
        </span>
        <div className="flex flex-col gap-2 md:flex-row">
          <button
            type="button"
            disabled
            className="btn-secondary opacity-60"
          >
            Mark completed
          </button>
          <button
            type="button"
            disabled
            className="btn-ghost opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function getBookingProcessingStatus(
  booking: BookingRecord,
  business: BusinessProfile,
) {
  if (booking.status !== 'confirmed') {
    return 'Booking state updated';
  }

  if (booking.google_event_id) {
    return 'Calendar synced';
  }

  if (booking.confirmation_sent !== true) {
    return 'Confirmation processing';
  }

  if (hasCalendarRefreshToken(business)) {
    return 'Calendar sync pending';
  }

  if (business.google_cal_token) {
    return 'Calendar unavailable';
  }

  return 'Confirmation sent';
}

function hasCalendarRefreshToken(business: BusinessProfile) {
  return Boolean(
    business.google_cal_token &&
      typeof business.google_cal_token === 'object' &&
      'refresh_token' in business.google_cal_token &&
      (business.google_cal_token as { refresh_token?: string | null })
        .refresh_token,
  );
}
