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
    <section className="px-2 pb-10 pt-6">
      <div className="space-y-3">
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
