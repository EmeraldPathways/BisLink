'use client';

import { Check, Star } from 'lucide-react';
import { getInitials } from '@/lib/utils/formatting';
import type { BusinessProfile, ReviewRecord } from '@/types';

export function ReviewsTab({
  business,
  reviews,
  breakdown,
  onBook
}: {
  business: BusinessProfile;
  reviews: ReviewRecord[];
  breakdown: Array<{ rating: number; count: number; percent: number }>;
  onBook: () => void;
}) {
  const published = reviews.filter((review) => review.is_published);
  const average = published.reduce((sum, review) => sum + review.rating, 0) / Math.max(published.length, 1);

  return (
    <section className="space-y-4 px-2 pb-10 pt-6">
      <div className="rounded-[18px] bg-[var(--void)] px-5 py-6 text-center text-[var(--hero-text-1)]">
        <p className="font-display text-[64px] leading-none tracking-[-2px]">{average.toFixed(1)}</p>
        <div className="mt-2 flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
          ))}
        </div>
        <p className="mt-3 text-[13px] text-[var(--hero-text-3)]">Based on {published.filter((review) => review.is_verified).length} verified reviews</p>
        <div className="mt-5 space-y-2">
          {breakdown.map((item) => (
            <div key={item.rating} className="flex items-center gap-3 text-sm">
              <span className="flex w-8 items-center gap-0.5 text-left text-[var(--hero-text-2)]">{item.rating}<Star className="h-2.5 w-2.5 fill-current" /></span>
              <div className="h-1.5 flex-1 rounded-full bg-white/10">
                <div className="h-1.5 rounded-full bg-[var(--gold)]" style={{ width: `${item.percent * 100}%` }} />
              </div>
              <span className="w-10 text-right text-[12px] text-[var(--hero-text-3)]">{Math.round(item.percent * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
      {published.map((review) => (
        <div key={review.id} className="rounded-[16px] border-[1.5px] border-[var(--border)] bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[var(--gold-muted)] text-sm font-semibold text-[var(--gold-dark)]">
                {getInitials(review.customer_name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-1)]">{review.customer_name}</p>
                {review.is_verified ? <p className="flex items-center gap-1 text-[11px] font-medium text-[var(--green)]"><Check className="h-3 w-3" /> Verified booking</p> : null}
              </div>
            </div>
            <div className="text-right">
              <div className="flex gap-0.5">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />)}</div>
              <p className="mt-1 text-[11px] text-[var(--text-6)]">{new Date(review.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-[1.65] text-[var(--text-2)]">{review.text}</p>
        </div>
      ))}
      <div className="rounded-[18px] bg-[var(--surface-2)] px-5 py-5 text-center">
        <h3 className="font-display text-[20px] text-[var(--text-1)]">Ready to start?</h3>
        <p className="mt-2 text-sm text-[var(--text-3)]">Join {published.length}+ people who&apos;ve trained with {business.name}</p>
        <button onClick={onBook} className="mt-4 rounded-[15px] bg-[var(--void)] px-5 py-3 text-sm font-semibold text-white">
          Book a Session →
        </button>
      </div>
    </section>
  );
}
