'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function ServiceCardActions({ serviceId, isActive }: { serviceId: string; isActive: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function toggleActive() {
    setError(null);
    const res = await fetch(`/api/owner/services/${serviceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive })
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Failed to update service');
      return;
    }

    startTransition(() => router.refresh());
  }

  async function deleteService() {
    setError(null);
    if (!window.confirm('Delete this service? This cannot be undone.')) {
      return;
    }

    const res = await fetch(`/api/owner/services/${serviceId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Failed to delete service');
      return;
    }

    startTransition(() => {
      router.push('/services');
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <Link href={`/services?edit=${serviceId}`} className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-[13px] font-medium">
          Edit
        </Link>
        <button onClick={toggleActive} disabled={isPending} className="rounded-xl bg-[var(--color-void)] px-3 py-2 text-[13px] font-medium text-white disabled:opacity-60">
          {isActive ? 'Disable' : 'Enable'}
        </button>
        <button onClick={deleteService} disabled={isPending} className="rounded-xl border border-red-200 px-3 py-2 text-[13px] font-medium text-red-700 disabled:opacity-60">
          Delete
        </button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
