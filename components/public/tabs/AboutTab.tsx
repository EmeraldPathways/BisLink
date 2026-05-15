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
            <div className="px-1 py-1 sm:px-2">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex h-[clamp(3rem,9vw,4.25rem)] w-[clamp(3rem,9vw,4.25rem)] shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                  <UserRound className="h-[clamp(1.5rem,4vw,2rem)] w-[clamp(1.5rem,4vw,2rem)] stroke-[1.7]" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-[var(--text-1)] sm:text-[28px]">Story</h3>
                  <p className="mt-4 text-[15px] leading-[1.6] text-[var(--text-2)] sm:mt-5 sm:text-[16px] sm:leading-[1.62]">{storyPreview}</p>
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
            <div className="space-y-5">
              {visibleStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`px-1 sm:px-2 ${index === 0 ? '' : ''}`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-[clamp(3rem,8vw,4rem)] w-[clamp(3rem,8vw,4rem)] shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                      <stat.icon className="h-[clamp(1.5rem,4vw,2rem)] w-[clamp(1.5rem,4vw,2rem)] stroke-[1.7]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[18px] font-semibold leading-none tracking-[-0.02em] text-[var(--text-1)] sm:text-[22px]">{stat.value}</p>
                      <p className="mt-2 text-[9px] uppercase leading-4 tracking-[0.12em] text-[var(--accent-strong)] sm:text-[10px]">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {onBook ? (
            <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--page-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--page-surface-muted)_82%,var(--accent-soft))_0%,color-mix(in_srgb,var(--page-card-bg)_88%,var(--accent-soft))_100%)] px-5 py-5 shadow-[var(--card-shadow)] sm:flex-row sm:items-center sm:justify-between sm:py-6">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-[clamp(3rem,8vw,4rem)] w-[clamp(3rem,8vw,4rem)] shrink-0 items-center justify-center rounded-full border border-[var(--page-border-strong)] bg-[color-mix(in_srgb,var(--page-card-bg)_74%,var(--accent-soft))] text-[var(--accent)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--page-border)_72%,transparent)]">
                  <Calendar className="h-[clamp(1.5rem,4vw,2rem)] w-[clamp(1.5rem,4vw,2rem)] stroke-[1.7]" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[var(--text-1)] sm:text-[16px]">Ready to start your journey?</p>
                  <p className="mt-1.5 max-w-[18rem] text-[13px] leading-[1.45] text-[var(--text-2)] sm:mt-2 sm:text-[15px] sm:leading-[1.45]">Book a session and let&apos;s work together.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onBook}
                className="inline-flex h-11 w-full items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-5 text-[13px] font-semibold text-white shadow-[0_18px_32px_rgba(139,104,37,0.22)] sm:h-auto sm:w-auto sm:shrink-0 sm:rounded-[18px] sm:px-7 sm:py-4 sm:text-[15px]"
              >
                {ctaLabel}
              </button>
            </div>
          ) : null}

          {extraStats.length ? (
            <div className="space-y-5">
              {extraStats.map((stat) => (
                <div
                  key={stat.label}
                  className="px-1 sm:px-2"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-[clamp(3rem,8vw,4rem)] w-[clamp(3rem,8vw,4rem)] shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                      <stat.icon className="h-[clamp(1.5rem,4vw,2rem)] w-[clamp(1.5rem,4vw,2rem)] stroke-[1.7]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[18px] font-semibold leading-none tracking-[-0.02em] text-[var(--text-1)] sm:text-[22px]">{stat.value}</p>
                      <p className="mt-2 text-[9px] uppercase leading-4 tracking-[0.12em] text-[var(--accent-strong)] sm:text-[10px]">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {hasCredentials ? (
            <div className="border-t border-[var(--page-border)] px-1 pt-5 sm:px-2">
              <h3 className="text-[19px] font-semibold text-[var(--text-1)]">Credentials</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {credentials.map((credential) => (
                  <span key={credential.id} className="flex items-center gap-1 rounded-full bg-[var(--badge-soft-bg)] px-3 py-1.5 text-[11px] font-semibold text-[var(--badge-soft-text)]">
                    <Check className="h-[clamp(0.75rem,2vw,0.875rem)] w-[clamp(0.75rem,2vw,0.875rem)]" aria-hidden="true" /> {credential.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {hasSpecialisms ? (
            <div className="border-t border-[var(--page-border)] px-1 pt-5 sm:px-2">
              <h3 className="text-[19px] font-semibold text-[var(--text-1)]">Specialisms</h3>
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
