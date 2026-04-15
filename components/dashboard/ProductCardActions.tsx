'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function ProductCardActions({ productId, isActive }: { productId: string; isActive: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function toggleActive() {
    setError(null);
    const res = await fetch(`/api/owner/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive })
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Failed to update product');
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <Link href={`/products?edit=${productId}`} className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-[13px] font-medium">
          Edit
        </Link>
        <button onClick={toggleActive} disabled={isPending} className="rounded-xl bg-[var(--color-void)] px-3 py-2 text-[13px] font-medium text-white disabled:opacity-60">
          {isActive ? 'Disable' : 'Enable'}
        </button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
