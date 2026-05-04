'use client';

import { Check } from 'lucide-react';
import type { BusinessProfile, CredentialRecord, ReviewRecord, SpecialismRecord } from '@/types';

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
  onBook: () => void;
}) {
  const hasBio = Boolean(business.full_bio?.trim());
  const hasCredentials = credentials.length > 0;
  const hasSpecialisms = specialisms.length > 0;
  const stats = [
    business.years_experience ? { label: 'Years Experience', value: `${business.years_experience}+` } : null,
    business.stat_one_label && business.stat_one_value ? { label: business.stat_one_label, value: business.stat_one_value } : null,
    business.stat_two_label && business.stat_two_value ? { label: business.stat_two_label, value: business.stat_two_value } : null,
    business.stat_three_label && business.stat_three_value ? { label: business.stat_three_label, value: business.stat_three_value } : null
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <section id={id} className="scroll-mt-20 space-y-4 px-2 pb-10 pt-6">
      <div className="px-3">
        <h2 className="font-display text-3xl text-[var(--text-1)]">About</h2>
      </div>

      {stats.length ? (
        <div className={`grid gap-3 ${stats.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] px-3 py-4 text-center shadow-[var(--card-shadow)]"
            >
              <p className="font-display text-[26px] font-semibold text-[var(--text-1)]">{stat.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[var(--text-5)]">{stat.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      {hasBio ? (
        <div className="rounded-[var(--card-radius)] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] p-5 shadow-[var(--card-shadow)]">
          <h3 className="font-display text-[19px] text-[var(--text-1)]">Story</h3>
          <div className="mt-4 space-y-4">
            {(business.full_bio ?? '')
              .split('\n')
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index} className="text-[14px] leading-[1.75] text-[var(--text-2)]">
                  {paragraph}
                </p>
              ))}
          </div>
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

      <button type="button" onClick={onBook} className="w-full rounded-[var(--button-radius)] bg-[var(--cta-bg)] px-5 py-4 text-sm font-semibold text-[var(--cta-text)]">
        Book a Session
      </button>
    </section>
  );
}
