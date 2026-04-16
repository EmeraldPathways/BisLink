'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { formatPrice, formatTimeLabel } from '@/lib/utils/formatting';
import type { BusinessProfile } from '@/types';
import type { Service } from './BookingPage';

export function StepConfirm({
  business,
  service,
  date,
  time,
  details,
  bookingId,
  onReset
}: {
  business: BusinessProfile;
  service: Service;
  date: string;
  time: string;
  details: { name: string; email: string };
  bookingId: string;
  onReset: () => void;
}) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0, rotate: -18 }}
        animate={{ scale: [0, 1.08, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-[26px] bg-gradient-to-br from-[var(--color-void)] to-[#2a2620] text-[30px] text-[var(--color-gold)] shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
      >
        OK
      </motion.div>

      <motion.h3 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 font-display text-[30px]">
        You&apos;re booked!
      </motion.h3>
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
        Confirmation sent to {details.email}. We&apos;ll remind you before your session.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-5 rounded-[15px] bg-[var(--color-surface-2)] px-4 py-4 text-left"
      >
        <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <div className="flex items-center justify-between">
            <span>Service</span>
            <span className="font-semibold text-[var(--color-text-primary)]">{service.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Date</span>
            <span className="font-semibold text-[var(--color-text-primary)]">{format(new Date(`${date}T00:00:00`), 'EEE, d MMM')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Time</span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {formatTimeLabel(new Date(`${date}T${time}:00`), business.timezone)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Duration</span>
            <span className="font-semibold text-[var(--color-text-primary)]">{service.duration_minutes} min</span>
          </div>
          <div className="h-px bg-[var(--color-border-2)]" />
          <div className="flex items-center justify-between">
            <span>Paid</span>
            <span className="font-semibold text-[var(--color-text-primary)]">{formatPrice(service.price, service.currency)}</span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-5 space-y-3">
        <div className="rounded-2xl bg-[var(--color-surface-3)] px-4 py-4 text-sm font-semibold text-[var(--color-text-primary)]">
          Booking reference: {bookingId.slice(0, 8).toUpperCase()}
        </div>
        <button onClick={onReset} className="w-full rounded-2xl bg-transparent px-4 py-3 text-sm font-semibold text-[#c0bcb6]">
          Back to services
        </button>
      </motion.div>
    </div>
  );
}
