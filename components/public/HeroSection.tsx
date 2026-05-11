'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronRight, MapPin, Megaphone, Star } from 'lucide-react';
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
    <header className="relative isolate px-2 pt-4 md:px-0 md:pt-0">
      <div className="overflow-hidden rounded-b-[32px] border border-[var(--page-border)] border-t-0 bg-[var(--page-card-bg)] shadow-[0_24px_60px_rgba(43,25,8,0.08)]">
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
          <div className="border-y border-[color:color-mix(in_srgb,var(--accent)_18%,var(--page-border))] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--accent-soft)_72%,white),color-mix(in_srgb,var(--page-surface)_90%,white))] px-5 py-3.5">
            <div className="flex items-center gap-3 text-[13px] font-medium text-[var(--accent-strong)] sm:text-[14px]">
              <Megaphone className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate sm:whitespace-normal">{announcementText}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-3)]" />
            </div>
          </div>
        ) : null}

        <div className="px-5 pb-6 pt-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: seq[0] }}
            className="grid grid-cols-[64px_minmax(0,1fr)_78px] items-start gap-x-3 gap-y-2 sm:grid-cols-[64px_minmax(0,1fr)_max-content] sm:gap-x-4"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--page-border)] bg-[linear-gradient(135deg,#f4deb0,var(--accent))] font-display text-[22px] font-semibold text-[var(--accent-contrast)] shadow-[0_10px_22px_rgba(62,35,8,0.1)]">
              {business.photo_url ? (
                <Image alt={business.name} className="h-full w-full object-cover" height={64} src={business.photo_url} width={64} />
              ) : (
                getInitials(business.name)
              )}
            </div>

            <div className="min-w-0 pt-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                {business.category}
              </div>
              <h1 className="mt-1 font-display text-[21px] leading-[0.95] text-[var(--text-1)] sm:text-[24px] md:text-[28px]">
                {business.name}
              </h1>
              <p className="mt-1 text-[12px] leading-5 text-[var(--accent-strong)] md:text-[13px]">
                {business.tagline?.trim() || 'Meaningful care. Clear next steps.'}
              </p>
              {hasReviews ? (
                <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[var(--text-2)]">
                  <Star className="h-3 w-3 fill-[var(--accent)] text-[var(--accent)]" />
                  <span className="font-medium text-[var(--text-1)]">{rating.toFixed(1)}</span>
                  <span>({reviewCount} reviews)</span>
                </div>
              ) : null}
            </div>

            <div className="flex w-[78px] shrink-0 flex-col items-end gap-2 pt-1 text-right sm:w-auto">
              <SocialIconLinks business={business} variant="hero" />
              {hasLocation ? (
                <div className="flex items-center gap-1 text-[11px] text-[var(--text-2)] md:text-[13px] sm:justify-end">
                  <MapPin className="h-3.5 w-3.5 text-[var(--accent-strong)]" />
                  <span className="whitespace-nowrap">{business.location}</span>
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[3] }} className="mt-5 border-t border-[var(--page-border)] pt-5 text-[14px] leading-7 text-[var(--text-2)] sm:text-[15px] sm:leading-[1.9]">
            {heroBio}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: seq[3] }}>
            <button
              type="button"
              onClick={onPrimaryAction}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-5 text-[17px] font-semibold text-white shadow-[0_18px_32px_rgba(139,104,37,0.22)] sm:h-14 sm:text-lg"
            >
              {business.primary_cta_label?.trim() || 'Book a Session'}
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
