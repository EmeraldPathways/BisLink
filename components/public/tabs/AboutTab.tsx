'use client';

import { Calendar, Check, Dumbbell, UserRound, Users } from 'lucide-react';
import type { BusinessProfile, CredentialRecord, ReviewRecord, SpecialismRecord } from '@/types';
import { SectionImageHeader } from '@/components/public/SectionImageHeader';

export function AboutTab({
  id = 'about',
  business,
  credentials,
  specialisms,
  reviews: _reviews,
  onBook
}: {
  id?: string;
  business: BusinessProfile;
  credentials: CredentialRecord[];
  specialisms: SpecialismRecord[];
  reviews: ReviewRecord[];
  onBook?: () => void;
}) {
  const hasBio = Boolean(business.full_bio?.trim());
  const hasCredentials = credentials.length > 0;
  const hasSpecialisms = specialisms.length > 0;
  const stats = [
    business.years_experience ? { label: 'Years Experience', value: `${business.years_experience}+`, icon: Calendar } : null,
    business.stat_one_label && business.stat_one_value ? { label: business.stat_one_label, value: business.stat_one_value, icon: Users } : null,
    business.stat_two_label && business.stat_two_value ? { label: business.stat_two_label, value: business.stat_two_value, icon: Dumbbell } : null,
    business.stat_three_label && business.stat_three_value ? { label: business.stat_three_label, value: business.stat_three_value, icon: Dumbbell } : null
  ].filter(Boolean) as Array<{ label: string; value: string; icon: typeof Calendar }>;
  const storyParagraphs = (business.full_bio ?? '')
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const storyPreview = storyParagraphs[0] ?? '';
  const ctaLabel = business.primary_cta_label?.trim() || 'Book Session';
  const [primaryStat, secondaryStat, tertiaryStat, ...extraStats] = stats;
  const visibleStats = [primaryStat, secondaryStat, tertiaryStat].filter(Boolean) as typeof stats;

  return (
    <section id={id} className="scroll-mt-20 px-2 pb-8 pt-3">
      <div className="overflow-hidden rounded-[32px] border border-[var(--page-border)] bg-[var(--page-card-bg)] shadow-[var(--card-shadow)]">
        <SectionImageHeader
          title={business.about_title?.trim() || 'About'}
          subtitle={business.about_subtitle?.trim() || 'Get to know me and my journey.'}
          imageUrl={business.about_image_url ?? business.cover_image_url}
          compact
          attached
        />

        <div className="space-y-5 px-4 py-4 sm:px-5 sm:py-5">
          {hasBio ? (
            <div className="rounded-[28px] border border-[rgba(214,194,164,0.38)] bg-[var(--page-card-bg)] px-6 py-7 shadow-[0_10px_26px_rgba(139,104,37,0.05)]">
              <div className="flex items-start gap-5">
                <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-[rgba(202,164,91,0.10)] text-[var(--accent)]">
                  <UserRound className="h-8 w-8 stroke-[1.7]" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-[28px] leading-none tracking-[-0.02em] text-[var(--text-1)]">Story</h3>
                  <p className="mt-5 text-[16px] leading-[1.62] text-[var(--text-2)]">{storyPreview}</p>
                </div>
              </div>
              {storyParagraphs.length > 1 ? (
                <div className="mt-5 space-y-4">
                  {storyParagraphs.slice(1).map((paragraph, index) => (
                    <p key={index} className="text-[14px] leading-[1.75] text-[var(--text-2)]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {visibleStats.length ? (
            <div className="grid grid-cols-2 gap-4">
              {visibleStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`rounded-[26px] border border-[rgba(214,194,164,0.36)] bg-[var(--page-card-bg)] px-5 py-6 shadow-[0_8px_22px_rgba(139,104,37,0.04)] ${
                    index === 2 ? 'col-span-1' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-[rgba(202,164,91,0.10)] text-[var(--accent)]">
                      <stat.icon className="h-8 w-8 stroke-[1.7]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-[22px] font-semibold leading-none tracking-[-0.02em] text-[var(--text-1)]">{stat.value}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[var(--accent-strong)]">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {onBook ? (
            <div className="flex items-center justify-between gap-4 rounded-[28px] bg-[linear-gradient(135deg,#f4efe6_0%,#f8f4ec_100%)] px-5 py-6 shadow-[0_10px_28px_rgba(139,104,37,0.06)]">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full border border-white/80 bg-[rgba(255,255,255,0.32)] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)]">
                  <Calendar className="h-8 w-8 stroke-[1.7] text-[var(--accent)]" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold text-[var(--text-1)]">Ready to start your journey?</p>
                  <p className="mt-2 text-[15px] leading-[1.45] text-[var(--text-2)]">Book a session and let&apos;s work together.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onBook}
                className="shrink-0 rounded-[18px] bg-[linear-gradient(135deg,#c99734_0%,#c7922f_100%)] px-7 py-4 text-[15px] font-medium text-white shadow-[0_16px_28px_rgba(139,104,37,0.18)]"
              >
                {ctaLabel}
              </button>
            </div>
          ) : null}

          {extraStats.length ? (
            <div className="grid grid-cols-2 gap-4">
              {extraStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[26px] border border-[rgba(214,194,164,0.36)] bg-[var(--page-card-bg)] px-5 py-6 shadow-[0_8px_22px_rgba(139,104,37,0.04)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-[rgba(202,164,91,0.10)] text-[var(--accent)]">
                      <stat.icon className="h-8 w-8 stroke-[1.7]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-[22px] font-semibold leading-none tracking-[-0.02em] text-[var(--text-1)]">{stat.value}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[var(--accent-strong)]">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {hasCredentials ? (
            <div className="rounded-[24px] bg-[var(--page-surface-muted)] p-5">
              <h3 className="font-display text-[19px] text-[var(--text-1)]">Credentials</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {credentials.map((credential) => (
                  <span key={credential.id} className="flex items-center gap-1 rounded-full bg-[var(--badge-soft-bg)] px-3 py-1.5 text-[11px] font-semibold text-[var(--badge-soft-text)]">
                    <Check className="h-3 w-3" aria-hidden="true" /> {credential.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {hasSpecialisms ? (
            <div className="rounded-[24px] bg-[var(--page-surface-muted)] p-5">
              <h3 className="font-display text-[19px] text-[var(--text-1)]">Specialisms</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {specialisms.map((specialism) => (
                  <span key={specialism.id} className="rounded-full bg-[var(--page-card-muted)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-2)]">
                    {specialism.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
