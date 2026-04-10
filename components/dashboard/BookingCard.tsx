import { formatPrice, formatTimeLabel } from '@/lib/utils/formatting';
import type { BookingRecord, BusinessProfile, ServiceRecord } from '@/types';

export function BookingCard({
  booking,
  business,
  service
}: {
  booking: BookingRecord;
  business: BusinessProfile;
  service: ServiceRecord;
}) {
  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-white p-5 shadow-[0_8px_28px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">{formatTimeLabel(booking.start_time, business.timezone)}</p>
          <p className="mt-1 text-sm text-[var(--color-text-primary)]">{booking.customer_name}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{service.name}</p>
        </div>
        <span className="rounded-full bg-[var(--color-gold-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-gold-dark)]">
          {booking.status}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
        <span>
          {service.duration_minutes} min · {formatPrice(service.price, service.currency)}
        </span>
        <div className="flex gap-2">
          <button className="rounded-xl bg-[var(--color-surface-3)] px-3 py-2 text-[13px] font-medium text-[var(--color-text-primary)]">
            Mark completed
          </button>
          <button className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-[13px] font-medium text-[var(--color-text-primary)]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
