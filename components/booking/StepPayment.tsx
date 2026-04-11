'use client';

import { format } from 'date-fns';
import { formatPrice, formatTimeLabel } from '@/lib/utils/formatting';
import type { BusinessProfile } from '@/types';
import type { Service } from './BookingPage';

export function StepPayment({
  business,
  service,
  date,
  time,
  onNext
}: {
  business: BusinessProfile;
  service: Service;
  date: string;
  time: string;
  details: { name: string; email: string; phone?: string };
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h3 className="font-display text-[26px] font-semibold">Payment</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Secured by Stripe</p>

      <div className="mt-5 flex items-center justify-between rounded-[15px] bg-[var(--color-surface-2)] px-4 py-4">
        <div>
          <p className="text-sm font-semibold">{service.name}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {format(new Date(`${date}T00:00:00`), 'EEE, d MMM')} - {formatTimeLabel(new Date(`${date}T${time}:00`), business.timezone)}
          </p>
        </div>
        <p className="text-[20px] font-bold">{formatPrice(service.price, service.currency)}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className="rounded-xl border-[1.5px] border-[#e0e0e0] bg-white px-4 py-3 text-sm font-semibold">Apple Pay</button>
        <button className="rounded-xl border-[1.5px] border-[#e0e0e0] bg-white px-4 py-3 text-sm font-semibold">Google Pay</button>
      </div>

      <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#c0c0be]">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <span>Or pay by card</span>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <div className="space-y-3">
        <input className="gold-ring w-full rounded-[13px] border-[1.5px] border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-[14px] text-[15px]" placeholder="Card number" />
        <div className="grid grid-cols-2 gap-3">
          <input className="gold-ring w-full rounded-[13px] border-[1.5px] border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-[14px] text-[15px]" placeholder="MM / YY" />
          <input className="gold-ring w-full rounded-[13px] border-[1.5px] border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-[14px] text-[15px]" placeholder="CVC" />
        </div>
      </div>

      <p className="mt-4 text-xs text-[#c0bcb6]">Your card details are encrypted and never stored</p>

      <button
        onClick={onNext}
        className="mt-6 w-full rounded-2xl bg-[var(--color-void)] px-4 py-4 text-sm font-semibold text-white"
      >
        Pay {formatPrice(service.price, service.currency)} - Confirm Booking
      </button>
    </div>
  );
}
