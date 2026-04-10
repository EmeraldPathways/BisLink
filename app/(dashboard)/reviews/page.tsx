import { ReviewsManager } from '@/components/dashboard/ReviewsManager';
import { demoReviews } from '@/lib/demo-data';

export default function Page() {
  const visible = demoReviews.filter((review) => review.is_published);
  const average = visible.reduce((sum, review) => sum + review.rating, 0) / Math.max(visible.length, 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-5xl">Reviews</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Manage verified social proof and request follow-up reviews from customers.</p>
        </div>
        <div className="rounded-[22px] bg-[var(--color-void)] px-6 py-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)]">Average rating</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-gold)]">{average.toFixed(1)}</p>
        </div>
      </div>
      <ReviewsManager reviews={demoReviews} />
    </div>
  );
}
