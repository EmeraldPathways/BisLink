'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import type { BusinessProfile } from '@/types';

type FormState = {
  name: string;
  category: string;
  bio: string;
  tagline: string;
  full_bio: string;
  location: string;
  address: string;
  instagram_handle: string;
  slug: string;
};

export function LinkEditor({ business }: { business: BusinessProfile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => buildFormState(business));

  useEffect(() => {
    setForm(buildFormState(business));
  }, [business]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setError(null);
    setMessage(null);
    const res = await fetch('/api/owner/business', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setError(data?.error ?? 'Failed to save link settings');
      return;
    }

    setMessage('Saved');
    startTransition(() => router.refresh());
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/${form.slug}`);
    setMessage('Link copied');
  }

  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <div className="space-y-3">
        <input value={form.name} onChange={(event) => updateField('name', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
        <input value={form.category} onChange={(event) => updateField('category', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
        <textarea value={form.bio} onChange={(event) => updateField('bio', event.target.value)} className="min-h-[100px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
        <input value={form.tagline} onChange={(event) => updateField('tagline', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
        <textarea value={form.full_bio} onChange={(event) => updateField('full_bio', event.target.value)} className="min-h-[140px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
        <input value={form.location} onChange={(event) => updateField('location', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
        <input value={form.address} onChange={(event) => updateField('address', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
        <input value={form.instagram_handle} onChange={(event) => updateField('instagram_handle', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
        <input value={form.slug} onChange={(event) => updateField('slug', event.target.value.toLowerCase())} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button onClick={copyLink} className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white">
          Copy Link
        </button>
        <a href={`/${form.slug}`} className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-center text-sm font-semibold">
          Open Link
        </a>
        <button onClick={save} disabled={isPending} className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold disabled:opacity-60">
          Save Changes
        </button>
      </div>
      {message ? <p className="mt-4 text-xs text-green-700">{message}</p> : null}
      {error ? <p className="mt-4 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function buildFormState(business: BusinessProfile): FormState {
  return {
    name: business.name,
    category: business.category,
    bio: business.bio,
    tagline: business.tagline ?? '',
    full_bio: business.full_bio ?? '',
    location: business.location ?? '',
    address: business.address ?? '',
    instagram_handle: business.instagram_handle ?? '',
    slug: business.slug
  };
}
