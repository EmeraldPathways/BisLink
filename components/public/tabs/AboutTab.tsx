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

  return (
    <section id={id} className="scroll-mt-20 space-y-5 px-2 pb-8 pt-4">
      <SectionImageHeader
        title="About"
        subtitle="Get to know me and my journey."
        imageUrl={business.cover_image_url}
      />

      {hasBio ? (
        <div className="rounded-[32px] border border-[var(--page-border)] bg-[var(--page-card-bg)] px-6 py-7 shadow-[var(--card-shadow)]">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <UserRound className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-[28px] leading-none text-[var(--text-1)]">Story</h3>
              <p className="mt-5 text-[16px] leading-9 text-[var(--text-2)]">{storyPreview}</p>
            </div>
          </div>
          {storyParagraphs.length > 1 ? (
            <div className="mt-5 space-y-4 border-t border-[var(--page-border)] pt-5">
              {storyParagraphs.slice(1).map((paragraph, index) => (
                <p key={index} className="text-[14px] leading-[1.8] text-[var(--text-2)]">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {stats.length ? (
        <div className={`grid gap-4 ${stats.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[26px] border border-[var(--page-border)] bg-[var(--page-card-bg)] px-6 py-6 shadow-[var(--card-shadow)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  <stat.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-[34px] font-semibold leading-none text-[var(--text-1)]">{stat.value}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-[var(--accent-strong)]">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {onBook ? (
        <div className="flex items-center justify-between gap-4 rounded-[30px] border border-[var(--page-border)] bg-[linear-gradient(135deg,var(--page-surface-muted),var(--page-card-bg))] px-5 py-5 shadow-[var(--card-shadow)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/60 bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Calendar className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[var(--text-1)]">Ready to start your journey?</p>
              <p className="mt-1 text-[14px] text-[var(--text-2)]">Book a session and let&apos;s work together.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBook}
            className="shrink-0 rounded-[18px] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(139,104,37,0.18)]"
          >
            {ctaLabel}
          </button>
        </div>
      ) : null}

      {hasCredentials ? (
        <div className="rounded-[var(--card-radius)] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] p-5 shadow-[var(--card-shadow)]">
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
        <div className="rounded-[var(--card-radius)] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] p-5 shadow-[var(--card-shadow)]">
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
    </section>
  );
}
