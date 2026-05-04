'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import type { BusinessProfile, CredentialRecord, ReviewRecord, SpecialismRecord } from '@/types';

export function AboutTab({
  business,
  credentials,
  specialisms,
  reviews,
  onBook
}: {
  business: BusinessProfile;
  credentials: CredentialRecord[];
  specialisms: SpecialismRecord[];
  reviews: ReviewRecord[];
  onBook: () => void;
}) {
  const published = reviews.filter((review) => review.is_published);
  const average = published.reduce((sum, review) => sum + review.rating, 0) / Math.max(published.length, 1);
  const hasReviews = published.length > 0;
  const hasBio = Boolean(business.full_bio?.trim());
  const hasCredentials = credentials.length > 0;
  const hasSpecialisms = specialisms.length > 0;
  const years = business.years_experience ?? 0;

  const stats = [
    years > 0 ? ['Years', String(years)] : ['Experience', 'New'],
    hasReviews ? ['Rating', average.toFixed(1)] : ['Rating', 'New'],
  ].filter(Boolean) as Array<[string, string]>;

  return (
    <section className="space-y-4 px-2 pb-10 pt-6">
      <div className="rounded-[18px] bg-[var(--void)] px-5 py-6 text-[var(--hero-text-1)]">
        <div className="flex items-center gap-4">
          <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] font-display text-2xl font-semibold text-[var(--void)]">
            {business.photo_url ? (
              <Image
                alt={business.name}
                className="h-full w-full object-cover"
                height={72}
                src={business.photo_url}
                width={72}
              />
            ) : (
              business.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--gold)]">
              {business.category}
              {years > 0 ? ` · ${years} Years` : null}
            </p>
            {business.tagline ? (
              <p className="mt-2 font-display text-[20px] italic text-[var(--gold)]">
                &quot;{business.tagline}&quot;
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <div className={`grid gap-3 ${stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="rounded-[14px] border-[1.5px] border-[var(--border)] bg-white px-3 py-4 text-center"
            >
              <p className="font-display text-[26px] font-semibold text-[var(--text-1)]">{value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[var(--text-5)]">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {hasBio && (
        <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-5">
          <h3 className="font-display text-[19px] text-[var(--text-1)]">My Story</h3>
          <div className="mt-4 space-y-4">
            {(business.full_bio ?? '')
              .split('\n')
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index} className="text-[14px] leading-[1.75] text-[var(--text-2)]">
                  {paragraph}
                </p>
              ))}
          </div>
        </div>
      )}

      {hasCredentials && (
        <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-5">
          <h3 className="font-display text-[19px] text-[var(--text-1)]">Credentials</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {credentials.map((credential) => (
              <span
                key={credential.id}
                className="flex items-center gap-1 rounded-full bg-[var(--gold-muted)] px-3 py-1.5 text-[11px] font-semibold text-[var(--gold-dark)]"
              >
                <Check className="h-3 w-3" aria-hidden="true" /> {credential.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasSpecialisms && (
        <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-5">
          <h3 className="font-display text-[19px] text-[var(--text-1)]">Specialisms</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {specialisms.map((specialism) => (
              <span
                key={specialism.id}
                className="rounded-full bg-[var(--surface-3)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-2)]"
              >
                {specialism.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onBook}
        className="w-full rounded-[15px] bg-[var(--void)] px-5 py-4 text-sm font-semibold text-white"
      >
        Book a Session
      </button>
    </section>
  );
}
