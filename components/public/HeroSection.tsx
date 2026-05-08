'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import type { BusinessProfile } from '@/types';
import { getInitials } from '@/lib/utils/formatting';
import { SocialIconLinks } from './SocialIconLinks';

export function HeroSection({
  business,
  rating,
  reviewCount,
  announcementText,
  onPrimaryAction
}: {
  business: BusinessProfile;
  rating: number;
  reviewCount: number;
  announcementText?: string | null;
  onPrimaryAction: () => void;
}) {
  const seq = [0, 0.07, 0.13, 0.19];
  const hasReviews = reviewCount > 0;
  const hasLocation = Boolean(business.location);
  const heroBio = business.bio?.trim() || business.tagline?.trim() || 'Book your next session in a few taps.';

  return (
    <header className="relative isolate px-4 pt-4 md:px-0 md:pt-0">
      <div className="overflow-hidden rounded-[32px] border border-[var(--page-border)] bg-[var(--page-card-bg)] shadow-[0_24px_60px_rgba(43,25,8,0.08)]">
        <div className="relative h-[240px] w-full overflow-hidden bg-[image:var(--hero-gradient)] md:h-[280px]">
          {business.cover_image_url ? (
            <Image src={business.cover_image_url} alt={`${business.name} cover image`} fill className="object-cover" priority />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[var(--hero-glow-soft)] blur-3xl" />
            <div className="absolute -right-8 top-8 h-36 w-36 rounded-full bg-white/20 blur-3xl" />
          </div>
        </div>

        {announcementText?.trim() ? (
          <div className="border-t border-[var(--page-border)] px-5 py-3 text-sm font-medium text-[var(--text-2)]">
            {announcementText}
          </div>
        ) : null}

        <div className="px-5 pb-6 pt-5">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[0] }} className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--page-border)] bg-[linear-gradient(135deg,#f4deb0,var(--accent))] font-display text-[26px] font-semibold text-[var(--accent-contrast)] shadow-[0_14px_30px_rgba(62,35,8,0.12)]">
                {business.photo_url ? (
                  <Image alt={business.name} className="h-full w-full object-cover" height={80} src={business.photo_url} width={80} />
                ) : (
                  getInitials(business.name)
                )}
              </div>

              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
                  {business.category}
                </div>
                <h1 className="mt-1 font-display text-[30px] leading-[0.98] text-[var(--text-1)] md:text-[34px]">
                  {business.name}
                </h1>
                <p className="mt-1 text-[15px] text-[var(--accent-strong)]">
                  {business.tagline?.trim() || 'Meaningful care. Clear next steps.'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[2] }} className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[var(--text-2)]">
            {hasReviews ? (
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" />
                <span className="font-medium text-[var(--text-1)]">{rating.toFixed(1)}</span>
                <span>({reviewCount} reviews)</span>
              </span>
            ) : null}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[2] }} className="mt-4">
            <SocialIconLinks business={business} variant="hero" />
          </motion.div>

          {hasLocation ? (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[2] }} className="mt-4 flex items-center gap-1.5 text-[14px] text-[var(--text-2)]">
              <MapPin className="h-4 w-4 text-[var(--accent-strong)]" />
              <span>{business.location}</span>
            </motion.div>
          ) : null}

          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[3] }} className="mt-5 text-[16px] leading-8 text-[var(--text-2)]">
            {heroBio}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[3] }}>
            <button
              type="button"
              onClick={onPrimaryAction}
              className="mt-6 inline-flex w-full items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-5 py-4 text-lg font-semibold text-white shadow-[0_18px_32px_rgba(139,104,37,0.22)]"
            >
              {business.primary_cta_label?.trim() || 'Book a Session'}
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
