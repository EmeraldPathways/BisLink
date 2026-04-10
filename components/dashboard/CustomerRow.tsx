import { formatDateTimeLabel, formatPrice } from '@/lib/utils/formatting';
import type { CustomerRecord } from '@/types';

export function CustomerRow({ customer }: { customer: CustomerRecord }) {
  return (
    <div className="grid grid-cols-[1.2fr_0.6fr_0.6fr_0.8fr_120px] items-center gap-3 rounded-[18px] bg-white px-4 py-4 text-sm">
      <div>
        <p className="font-semibold text-[var(--color-text-primary)]">{customer.name}</p>
        <p className="text-[var(--color-text-secondary)]">{customer.email}</p>
      </div>
      <span>{customer.total_bookings}</span>
      <span>{formatPrice(customer.total_spent)}</span>
      <span>{customer.last_booking_at ? formatDateTimeLabel(customer.last_booking_at, 'America/New_York') : '—'}</span>
      <button className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-[13px] font-medium">View history</button>
    </div>
  );
}
