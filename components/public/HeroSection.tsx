'use client';

import { motion } from 'framer-motion';
import { MapPin, Star } from 'lucide-react';
import type { BusinessProfile } from '@/types';
import { getInitials } from '@/lib/utils/formatting';
import { TabBar, type PublicTab } from './TabBar';

export function HeroSection({
  business,
  rating,
  reviewCount,
  activeTab,
  onTabChange
}: {
  business: BusinessProfile;
  rating: number;
  reviewCount: number;
  activeTab: PublicTab;
  onTabChange: (tab: PublicTab) => void;
}) {
  const seq = [0, 0.07, 0.13, 0.19, 0.25, 0.31];
  const hasReviews = reviewCount > 0;
  const hasLocation = Boolean(business.location);

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(165deg,#0C0B09_0%,#1C1610_55%,#0F0D0B_100%)] pt-12 text-[var(--hero-text-1)]">
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[var(--gold)]/10 blur-3xl" />
      <div className="absolute -right-10 top-8 h-40 w-40 rounded-full bg-[var(--gold)]/10 blur-3xl" />
      <div className="px-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[0] }} className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] font-display text-xl font-semibold text-[var(--void)]">
            {business.photo_url ? <img alt={business.name} className="h-full w-full object-cover" src={business.photo_url} /> : getInitials(business.name)}
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--gold)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse-dot" />
              <span>{business.category}</span>
            </div>
            <h1 className="mt-1 font-display text-[26px] font-semibold leading-[1.08]">{business.name}</h1>
          </div>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[1] }} className="mt-3 text-[13px] font-light leading-[1.65] text-[var(--hero-text-2)]">
          {business.bio}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[2] }} className="mt-4 flex items-center gap-3 text-[13px] text-[var(--hero-text-3)]">
          {hasReviews ? (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
              <span className="font-medium text-[var(--hero-text-1)]">{rating.toFixed(1)}</span>
              <span>({reviewCount} reviews)</span>
            </span>
          ) : (
            <span className="text-[var(--hero-text-2)]">New profile</span>
          )}
          {hasLocation ? <span className="h-[14px] w-px bg-[var(--border-hero)]" /> : null}
          {hasLocation ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {business.location}
            </span>
          ) : null}
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[3] }} className="mt-6">
        <TabBar activeTab={activeTab} onChange={onTabChange} />
      </motion.div>
    </section>
  );
}
