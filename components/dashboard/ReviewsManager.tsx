import { Star } from 'lucide-react';
import type { ReviewRecord } from '@/types';

export function ReviewsManager({ reviews }: { reviews: ReviewRecord[] }) {
  return (
    <div className="space-y-3 rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-[18px] bg-[var(--color-surface-2)] px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{review.customer_name}</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{review.text}</p>
            </div>
            <div className="text-right">
              <p className="flex items-center gap-1 text-sm font-semibold text-[var(--color-gold-dark)]">{review.rating}<Star className="h-3 w-3 fill-current" /></p>
              <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">{review.is_verified ? 'Verified' : 'Unverified'}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-[13px] font-medium">Hide</button>
            <button className="rounded-xl bg-[var(--color-void)] px-3 py-2 text-[13px] font-medium text-white">Request review</button>
          </div>
        </div>
      ))}
    </div>
  );
}
