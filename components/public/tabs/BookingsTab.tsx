'use client';

import { motion } from 'framer-motion';
import { ServiceCard } from '@/components/booking/ServiceCard';
import type { ServiceRecord } from '@/types';

export function BookingsTab({
  services,
  onSelect
}: {
  services: ServiceRecord[];
  onSelect: (service: ServiceRecord) => void;
}) {
  return (
    <section className="px-5 pb-10 pt-6">
      <h2 className="font-display text-[24px] font-semibold tracking-[-0.3px] text-[var(--text-1)]">Book a Session</h2>
      <p className="mt-1 text-[13px] text-[var(--text-4)]">Tap a service to check availability</p>
      <div className="mt-4 space-y-3">
        {services.map((service, index) => (
          <motion.div key={service.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
            <ServiceCard service={service} onClick={() => onSelect(service)} />
          </motion.div>
        ))}
      </div>
      <p className="pt-8 text-center text-[11px] text-[var(--text-7)]">Powered by Your Business in a Link</p>
    </section>
  );
}
