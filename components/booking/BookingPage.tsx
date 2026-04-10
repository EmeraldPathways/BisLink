'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookingSheet } from './BookingSheet';
import { BusinessHero } from './BusinessHero';
import { ServiceCard } from './ServiceCard';
import type { BusinessProfile, ServiceRecord } from '@/types';

export type Service = ServiceRecord;

export function BookingPage({ business, services }: { business: BusinessProfile; services: ServiceRecord[] }) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const ordered = useMemo(() => [...services].sort((a, b) => a.sort_order - b.sort_order), [services]);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="mx-auto grid min-h-screen max-w-[1280px] gap-0 xl:grid-cols-[430px_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[430px] bg-[var(--color-bg)] xl:border-r xl:border-[var(--color-border)]">
          <BusinessHero business={business} />
          <section className="px-5 pb-10 pt-6">
            <h2 className="font-display text-[24px] font-semibold tracking-[-0.3px] text-[var(--color-text-primary)]">
              Book a Session
            </h2>
            <p className="mt-1 text-[13px] text-[#999]">Tap a service to check availability</p>
            <div className="mt-4 space-y-3">
              {ordered.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.36 + index * 0.065 }}
                >
                  <ServiceCard service={service} onClick={() => setSelectedService(service)} />
                </motion.div>
              ))}
            </div>
          </section>
          <p className="pb-8 text-center text-[11px] text-[#ccc]">Powered by Your Business in a Link</p>
        </div>

        <section className="hidden bg-[linear-gradient(180deg,#f8f5ee_0%,#f4efe7_100%)] px-10 py-10 xl:block">
          <div className="mx-auto grid h-full max-w-3xl grid-rows-[auto_1fr] gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold-dark)]">
                Owner Preview
              </p>
              <h2 className="mt-3 font-display text-5xl leading-[1] tracking-[-0.8px] text-[var(--color-text-primary)]">
                The dashboard is part of the link.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
                Customers book on the left. New bookings, revenue, and calendar context show up instantly for the owner.
              </p>
            </div>

            <div className="grid gap-6 rounded-[34px] border border-[var(--color-border)] bg-white p-6 shadow-[0_24px_80px_rgba(12,11,9,0.08)]">
              <div className="grid grid-cols-4 gap-4">
                {[
                  ['Today', '2 bookings'],
                  ['This week', '$765'],
                  ['This month', '$2,140'],
                  ['Customers', '124 active']
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[20px] bg-[var(--color-surface-2)] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                      {label}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="rounded-[26px] border border-[var(--color-border)] p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                        Today
                      </p>
                      <h3 className="mt-2 font-display text-3xl">Upcoming bookings</h3>
                    </div>
                    <span className="rounded-full bg-[var(--color-gold-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-gold-dark)]">
                      Live
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      ['9:00 AM', 'Avery Stone', '1-on-1 Training Session'],
                      ['11:00 AM', 'Maya Lewis', 'Movement Assessment'],
                      ['3:00 PM', 'Noah Patel', 'Recovery & Mobility']
                    ].map(([time, name, service]) => (
                      <div key={`${time}-${name}`} className="flex items-center justify-between rounded-[22px] bg-[var(--color-surface-2)] px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold">{time}</p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {name} • {service}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--color-void)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-gold)]">
                          Confirmed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[26px] border border-[var(--color-border)] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                    This Week
                  </p>
                  <h3 className="mt-2 font-display text-3xl">Calendar</h3>
                  <div className="mt-5 grid grid-cols-7 gap-2 text-center text-[11px] text-[var(--color-text-secondary)]">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <p key={day}>{day}</p>
                    ))}
                    {Array.from({ length: 21 }).map((_, index) => (
                      <div
                        key={index}
                        className={`min-h-[56px] rounded-[18px] ${index === 9 ? 'bg-[var(--color-void)] text-white' : 'bg-[var(--color-surface-2)]'}`}
                      >
                        {index === 9 ? <div className="px-2 py-3 text-left text-[10px] font-semibold">11:00 Maya</div> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <BookingSheet business={business} service={selectedService} onClose={() => setSelectedService(null)} />
    </main>
  );
}
