'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminActionButton({
  label,
  endpoint,
  method = 'POST',
  body,
  tone = 'default'
}: {
  label: string;
  endpoint: string;
  method?: 'POST' | 'PATCH';
  body?: Record<string, unknown>;
  tone?: 'default' | 'danger';
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });

      const data = (await res.json().catch(() => null)) as { error?: string; url?: string } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? 'Action failed');
      }

      if (data?.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }

      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-60 ${
          tone === 'danger' ? 'border border-red-200 bg-red-50 text-red-700' : 'border border-[var(--color-border)] bg-white'
        }`}
      >
        {loading ? 'Working...' : label}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
