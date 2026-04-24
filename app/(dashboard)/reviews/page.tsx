import { ReviewsManager } from '@/components/dashboard/ReviewsManager';
import { getReviewsData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { reviews, average } = await getReviewsData();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-5xl">Reviews</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Manage verified social proof and request follow-up reviews from
            customers.
          </p>
        </div>
        <div className="rounded-[22px] bg-[var(--color-void)] px-6 py-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)]">
            Average rating
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-gold)]">
            {average.toFixed(1)}
          </p>
        </div>
      </div>
      <ReviewsManager reviews={reviews} />
    </div>
  );
}
