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
  onPrimaryAction
}: {
  business: BusinessProfile;
  rating: number;
  reviewCount: number;
  onPrimaryAction: () => void;
}) {
  const seq = [0, 0.07, 0.13, 0.19];
  const hasReviews = reviewCount > 0;
  const hasLocation = Boolean(business.location);
  const heroBio = business.tagline?.trim() || business.bio;

  return (
    <header className="relative isolate overflow-hidden rounded-t-[var(--hero-radius)] text-[var(--hero-text)]">
      <div className="relative h-[220px] w-full overflow-hidden bg-[image:var(--hero-gradient)]">
        {business.cover_image_url ? (
          <Image src={business.cover_image_url} alt={`${business.name} cover image`} fill className="object-cover" priority />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[var(--hero-glow-soft)] blur-3xl" />
          <div className="absolute -right-10 top-8 h-40 w-40 rounded-full bg-[var(--hero-glow-soft)] blur-3xl" />
        </div>
      </div>

      <div className="relative z-10 -mt-12 px-4 pb-6">
        <div className="rounded-[28px] border border-white/60 bg-[color:color-mix(in_srgb,var(--page-card-bg)_96%,white)] px-5 pb-6 pt-5 shadow-[0_22px_50px_rgba(19,14,10,0.12)] backdrop-blur">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[0] }} className="flex items-end gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--page-bg)] bg-[linear-gradient(135deg,var(--cta-accent-bg),var(--accent-strong))] font-display text-2xl font-semibold text-[var(--cta-accent-text)] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            {business.photo_url ? (
              <Image alt={business.name} className="h-full w-full object-cover" height={96} src={business.photo_url} width={96} />
            ) : (
              getInitials(business.name)
            )}
          </div>
          <div className="pb-2">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--hero-kicker)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse-dot" />
              <span>{business.category}</span>
            </div>
            <h1 className="mt-1 font-display text-[32px] font-semibold leading-[1.02] text-[var(--text-1)]">{business.name}</h1>
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[1] }} className="mt-4 text-[15px] leading-[1.7] text-[var(--text-2)]">
          {heroBio}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[2] }} className="mt-4 flex flex-wrap items-center gap-3 text-[13px] text-[var(--text-3)]">
          {hasReviews ? (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-[var(--accent)] text-[var(--accent)]" />
              <span className="font-medium text-[var(--text-1)]">{rating.toFixed(1)}</span>
              <span>({reviewCount} reviews)</span>
            </span>
          ) : null}
          {hasReviews && hasLocation ? <span className="h-[14px] w-px bg-[var(--hero-divider)]" /> : null}
          {hasLocation ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {business.location}
            </span>
          ) : null}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[3] }}>
          <SocialIconLinks business={business} variant="hero" />
          <button
            type="button"
            onClick={onPrimaryAction}
            className="mt-6 inline-flex w-full items-center justify-center rounded-[var(--button-radius)] bg-[var(--cta-bg)] px-5 py-4 text-sm font-semibold text-[var(--cta-text)] shadow-[0_16px_32px_rgba(22,16,10,0.2)]"
          >
            {business.primary_cta_label?.trim() || 'Book a Session'}
          </button>
        </motion.div>
        </div>
      </div>
    </header>
  );
}
