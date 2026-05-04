'use client';

import { Check, MessageSquare, Star } from 'lucide-react';
import { getReviewSummaryFromReviews } from '@/lib/reviews';
import { getInitials } from '@/lib/utils/formatting';
import type { BusinessProfile, ReviewRecord } from '@/types';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex justify-center gap-1" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => {
        const fillPercent = Math.min(Math.max(rating - index, 0), 1) * 100;
        return (
          <div key={index} className="relative h-4 w-4">
            <Star className="absolute inset-0 h-4 w-4" style={{ color: 'color-mix(in srgb, var(--accent) 25%, transparent)' }} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
              <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
  const reviewSummary = getReviewSummaryFromReviews(reviews);
  const hasReviews = reviewSummary.publishedCount > 0;

  return (
    <section className="space-y-4 px-2 pb-10 pt-6">
      {hasReviews ? (
        <div className="rounded-[var(--card-radius)] bg-[image:var(--hero-gradient)] px-5 py-6 text-center text-[var(--hero-text)]">
          <p className="font-display text-[64px] leading-none tracking-[-2px]">
            {reviewSummary.average.toFixed(1)}
          </p>
          <div className="mt-2">
            <StarRating rating={reviewSummary.average} />
          </div>
          <p className="mt-3 text-[13px] text-[var(--hero-text-muted)]">
            Based on {reviewSummary.publishedCount} review
            {reviewSummary.publishedCount !== 1 ? 's' : ''}
          </p>
          <div className="mt-5 space-y-2">
            {breakdown.map((item) => (
              <div key={item.rating} className="flex items-center gap-3 text-sm">
                <span className="flex w-8 items-center gap-0.5 text-left text-[var(--hero-text-secondary)]">
                  {item.rating}
                  <Star className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-[var(--accent)]"
                    style={{
                      width:
                        item.count === 0
                          ? '0%'
                          : `max(${Math.min(item.percent * 100, 100)}%, 4px)`
                    }}
                  />
                </div>
                <span className="w-10 text-right text-[12px] text-[var(--hero-text-muted)]">
                  {Math.round(item.percent * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-[var(--card-radius)] bg-[var(--page-surface-muted)] px-5 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--page-surface-emphasis)]">
            <MessageSquare className="h-6 w-6 text-[var(--text-3)]" />
          </div>
          <p className="mt-4 font-display text-[20px] text-[var(--text-1)]">
            No reviews yet
          </p>
          <p className="mt-2 text-sm text-[var(--text-3)]">
            Be the first to share your experience after your session.
          </p>
        </div>
      )}

      {published.map((review) => (
        <div
          key={review.id}
          className="rounded-[var(--card-radius)] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] p-4 shadow-[var(--card-shadow)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[var(--badge-soft-bg)] text-sm font-semibold text-[var(--badge-soft-text)]">
                {getInitials(review.customer_name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-1)]">
                  {review.customer_name}
                </p>
                {review.is_verified ? (
                  <p className="flex items-center gap-1 text-[11px] font-medium text-[var(--green)]">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Verified booking
                  </p>
                ) : null}
              </div>
            </div>
            <div className="text-right">
              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star key={index} className="h-3 w-3 fill-[var(--accent)] text-[var(--accent)]" aria-hidden="true" />
                ))}
              </div>
              <p className="mt-1 text-[11px] text-[var(--text-6)]">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-[1.65] text-[var(--text-2)]">
            {review.text}
          </p>
        </div>
      ))}

      <div className="rounded-[var(--card-radius)] bg-[var(--page-surface-muted)] px-5 py-5 text-center">
        <h3 className="font-display text-[20px] text-[var(--text-1)]">Ready to start?</h3>
        <p className="mt-2 text-sm text-[var(--text-3)]">
          {hasReviews
            ? `Join ${reviewSummary.publishedCount}+ people who've trained with ${business.name}`
            : `Be the first to book a session with ${business.name}`}
        </p>
        <button
          type="button"
          onClick={onBook}
          className="mt-4 rounded-[var(--button-radius)] bg-[var(--cta-bg)] px-5 py-3 text-sm font-semibold text-[var(--cta-text)]"
        >
          Book a session
        </button>
      </div>
    </section>
  );
}
