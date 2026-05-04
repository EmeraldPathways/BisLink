import type { BusinessProfile, ReviewRecord } from '@/types';

function truncateReview(text: string) {
  return text.length > 110 ? `${text.slice(0, 110)}...` : text;
}

export function TrustStrip({
  business,
  reviews,
  reviewSummary
}: {
  business: BusinessProfile;
  reviews: ReviewRecord[];
  reviewSummary: {
    average: number;
    publishedCount: number;
  };
}) {
  const published = reviews.filter((review) => review.is_published).slice(0, 2);
  if (!reviewSummary.publishedCount || !published.length) return null;

  return (
    <section aria-label="Customer reviews" className="px-2 pb-8">
      <div className="rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--page-card-bg)] p-4 shadow-[var(--card-shadow)]">
        <div className="flex flex-wrap items-center gap-2">
          <span aria-hidden="true">⭐</span>
          <span className="font-semibold text-[var(--text-1)]">
            {reviewSummary.average.toFixed(1)} from {reviewSummary.publishedCount} reviews
          </span>
          <span className="text-sm text-[var(--text-4)]">with {business.name}</span>
        </div>
        <div className="mt-3 grid gap-3">
          {published.map((review) => (
            <article key={review.id} className="rounded-[18px] bg-[var(--page-surface-muted)] px-3 py-3">
              <p className="text-sm leading-6 text-[var(--text-2)]">&ldquo;{truncateReview(review.text)}&rdquo;</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-5)]">
                {review.customer_name}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
