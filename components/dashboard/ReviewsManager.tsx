'use client';

import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { ReviewRecord } from '@/types';

export function ReviewsManager({ reviews }: { reviews: ReviewRecord[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function toggleVisibility(review: ReviewRecord) {
    setError(null);
    setPendingId(review.id);
    const res = await fetch(`/api/owner/reviews/${review.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !review.is_published })
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Failed to update review');
      setPendingId(null);
      return;
    }

    startTransition(() => {
      router.refresh();
      setPendingId(null);
    });
  }

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
              <p className="flex items-center gap-1 text-sm font-semibold text-[var(--color-gold-dark)]">
                {review.rating}
                <Star className="h-3 w-3 fill-current" />
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">{review.is_verified ? 'Verified' : 'Unverified'}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => toggleVisibility(review)}
              disabled={isPending && pendingId === review.id}
              className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-[13px] font-medium disabled:opacity-60"
            >
              {review.is_published ? 'Hide' : 'Publish'}
            </button>
            <button disabled className="rounded-xl bg-[var(--color-void)] px-3 py-2 text-[13px] font-medium text-white opacity-60">
              Request review
            </button>
          </div>
        </div>
      ))}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <p className="text-xs text-[var(--color-text-secondary)]">Review visibility is live. Follow-up review requests still need the outbound workflow hookup.</p>
    </div>
  );
}
