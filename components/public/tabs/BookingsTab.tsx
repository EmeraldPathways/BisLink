'use client';

import { motion } from 'framer-motion';
import type { BusinessProfile } from '@/types';
import { ServiceCard } from '@/components/booking/ServiceCard';
import type { ServiceRecord } from '@/types';
import { SectionImageHeader } from '@/components/public/SectionImageHeader';

export function BookingsTab({
  id = 'bookings',
  business,
  services,
  onSelect
}: {
  id?: string;
  business: BusinessProfile;
  services: ServiceRecord[];
  onSelect: (service: ServiceRecord) => void;
}) {
  return (
    <section id={id} className="scroll-mt-20 px-2 pt-3">
      <div className="overflow-hidden rounded-[32px] border border-[var(--page-border)] bg-[var(--page-card-bg)] shadow-[var(--card-shadow)]">
        <SectionImageHeader
          title="Bookings"
          subtitle="Choose your session and lock in a time that fits your schedule."
          imageUrl={business.cover_image_url}
          compact
          attached
        />
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid gap-3 min-[360px]:grid-cols-2">
            {services.map((service, index) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
                <ServiceCard service={service} onClick={() => onSelect(service)} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
