'use client';

import { motion } from 'framer-motion';
import { MapPin, Star } from 'lucide-react';
import type { BusinessProfile } from '@/types';
import { getInitials } from '@/lib/utils/formatting';

export function BusinessHero({ business }: { business: BusinessProfile }) {
  const seq = [0, 0.07, 0.13, 0.19, 0.25];

  return (
    <section className="noise-overlay relative overflow-hidden bg-gradient-to-br from-[var(--color-void)] to-[var(--color-void-2)] px-5 pb-8 pt-9 text-[var(--color-text-hero)]">
      <div className="absolute -left-10 bottom-2 h-32 w-32 rounded-full bg-[var(--color-gold)]/10 blur-2xl" />
      <div className="absolute -right-10 top-2 h-36 w-36 rounded-full bg-[var(--color-gold)]/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: seq[0] }}
        className="mb-4 flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] font-display text-[26px] font-semibold text-[var(--color-void)]"
      >
        {business.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={business.name} className="h-full w-full object-cover" src={business.photo_url} />
        ) : (
          getInitials(business.name)
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: seq[1] }}
        className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-gold)]"
      >
        <span>{business.category}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse-dot" />
        <span>Live</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: seq[2] }}
        className="mt-2 font-display text-[36px] font-semibold leading-[1.08] tracking-[-0.6px]"
      >
        {business.name}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: seq[3] }}
        className="mt-3 text-[14px] font-light leading-[1.65] text-[var(--color-text-hero-2)]"
      >
        {business.bio}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: seq[4] }}
        className="mt-4 flex items-center gap-3 text-[13px] text-[var(--color-text-hero-3)]"
      >
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-[var(--color-gold)] text-[var(--color-gold)]" />
          <span className="font-medium text-[var(--color-text-hero)]">4.9</span>
          <span>(143 reviews)</span>
        </span>
        <span className="h-[14px] w-px bg-[var(--color-border-dark)]" />
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {business.location}
        </span>
      </motion.div>
    </section>
  );
}
