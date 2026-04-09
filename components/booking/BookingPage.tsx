'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookingSheet } from './BookingSheet';
import { BusinessHero } from './BusinessHero';
import { ServiceCard } from './ServiceCard';

export type Service = {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  tag: string | null;
  emoji: string;
};

export function BookingPage({ business, services }: { business: any; services: Service[] }) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const ordered = useMemo(() => [...services], [services]);

  return (
    <main className="mx-auto min-h-screen max-w-[430px] bg-[var(--color-bg)]">
      <BusinessHero business={business} />
      <section className="px-5 pb-10 pt-6">
        <h2 className="font-display text-3xl">Book a Session</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">Tap a service to check availability</p>
        <div className="mt-4 space-y-3">
          {ordered.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 + i * 0.065 }}
            >
              <ServiceCard service={service} onClick={() => setSelectedService(service)} />
            </motion.div>
          ))}
        </div>
      </section>
      <p className="pb-8 text-center text-xs text-zinc-400">Powered by Your Business in a Link</p>
      <BookingSheet business={business} service={selectedService} onClose={() => setSelectedService(null)} />
    </main>
  );
}
