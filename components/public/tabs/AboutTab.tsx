'use client';

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

  return (
    <section className="space-y-4 px-5 pb-10 pt-6">
      <div className="rounded-[18px] bg-[var(--void)] px-5 py-6 text-[var(--hero-text-1)]">
        <div className="flex items-center gap-4">
          <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] font-display text-2xl font-semibold text-[var(--void)]">
            {business.photo_url ? <img alt={business.name} className="h-full w-full object-cover" src={business.photo_url} /> : business.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--gold)]">
              {business.category} · {business.years_experience ?? 0} Years
            </p>
            <p className="mt-2 font-display text-[20px] italic text-[var(--gold)]">&quot;{business.tagline}&quot;</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Years', String(business.years_experience ?? 0)],
          ['Clients', String(124)],
          ['Rating', average.toFixed(1)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-[14px] border-[1.5px] border-[var(--border)] bg-white px-3 py-4 text-center">
            <p className="font-display text-[26px] font-semibold text-[var(--text-1)]">{value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[var(--text-5)]">{label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-5">
        <h3 className="font-display text-[19px] text-[var(--text-1)]">My Story</h3>
        <div className="mt-4 space-y-4">
          {(business.full_bio ?? '').split('\n').filter(Boolean).map((paragraph, index) => (
            <p key={index} className="text-[14px] leading-[1.75] text-[var(--text-2)]">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
      <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-5">
        <h3 className="font-display text-[19px] text-[var(--text-1)]">Credentials</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {credentials.map((credential) => (
            <span key={credential.id} className="rounded-full bg-[var(--gold-muted)] px-3 py-1.5 text-[11px] font-semibold text-[var(--gold-dark)]">
              ✓ {credential.label}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-5">
        <h3 className="font-display text-[19px] text-[var(--text-1)]">Specialisms</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {specialisms.map((specialism) => (
            <span key={specialism.id} className="rounded-full bg-[var(--surface-3)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-2)]">
              {specialism.label}
            </span>
          ))}
        </div>
      </div>
      <button onClick={onBook} className="w-full rounded-[15px] bg-[var(--void)] px-5 py-4 text-sm font-semibold text-white">
        Book a Session with {business.name.split(' ')[0]} →
      </button>
    </section>
  );
}
