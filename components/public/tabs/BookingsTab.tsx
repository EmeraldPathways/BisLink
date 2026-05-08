'use client';

import { motion } from 'framer-motion';
import { ServiceCard } from '@/components/booking/ServiceCard';
import type { ServiceRecord } from '@/types';

export function BookingsTab({
  id = 'bookings',
  services,
  onSelect
}: {
  id?: string;
  services: ServiceRecord[];
  onSelect: (service: ServiceRecord) => void;
}) {
  return (
    <section id={id} className="scroll-mt-20 px-4 pb-4 pt-6 md:px-2">
      <div className="pb-4">
        <h2 className="font-display text-3xl text-[var(--text-1)]">Work With Me</h2>
      </div>
      <div className="grid gap-4 min-[360px]:grid-cols-2">
        {services.map((service, index) => (
          <motion.div key={service.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
            <ServiceCard service={service} onClick={() => onSelect(service)} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
