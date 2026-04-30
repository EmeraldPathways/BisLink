'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Check, Dumbbell, Flower2, Sparkles } from 'lucide-react';
import { BUSINESS_THEMES, type BusinessThemeDefinition } from '@/lib/business-themes';
import type { BusinessProfile, BusinessThemeKey } from '@/types';

type FormState = {
  name: string;
  category: string;
  theme_key: BusinessThemeKey;
  bio: string;
  tagline: string;
  full_bio: string;
  location: string;
  address: string;
  instagram_handle: string;
  slug: string;
};

const themeIcons: Record<BusinessThemeKey, typeof Sparkles> = {
  'classic-luxe': Sparkles,
  'wellness-studio': Flower2,
  'bright-performance': Dumbbell
};

export function LinkEditor({
  business,
  onThemePreviewChange
}: {
  business: BusinessProfile;
  onThemePreviewChange?: (themeKey: BusinessThemeKey) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => buildFormState(business));

  useEffect(() => {
    setForm(buildFormState(business));
    onThemePreviewChange?.(business.theme_key);
  }, [business, onThemePreviewChange]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === 'theme_key') {
      onThemePreviewChange?.(value as BusinessThemeKey);
    }
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
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            Theme
          </label>
          <div className="grid gap-3">
            {BUSINESS_THEMES.map((theme) => (
              <ThemeOptionCard
                key={theme.key}
                theme={theme}
                selected={form.theme_key === theme.key}
                onSelect={() => updateField('theme_key', theme.key)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="link-name" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            Business name
          </label>
          <input
            id="link-name"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="link-category" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            Category
          </label>
          <input
            id="link-category"
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="link-bio" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            Short bio{' '}
            <span className="font-normal normal-case text-[var(--color-text-tertiary)]">(hero section)</span>
          </label>
          <textarea
            id="link-bio"
            value={form.bio}
            onChange={(event) => updateField('bio', event.target.value)}
            className="min-h-[100px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="link-tagline" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            Tagline
          </label>
          <input
            id="link-tagline"
            value={form.tagline}
            onChange={(event) => updateField('tagline', event.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="link-full-bio" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            Full bio{' '}
            <span className="font-normal normal-case text-[var(--color-text-tertiary)]">(About tab)</span>
          </label>
          <textarea
            id="link-full-bio"
            value={form.full_bio}
            onChange={(event) => updateField('full_bio', event.target.value)}
            className="min-h-[140px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="link-location" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            Location{' '}
            <span className="font-normal normal-case text-[var(--color-text-tertiary)]">(e.g. Brooklyn, NY)</span>
          </label>
          <input
            id="link-location"
            value={form.location}
            onChange={(event) => updateField('location', event.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="link-address" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            Full address
          </label>
          <input
            id="link-address"
            value={form.address}
            onChange={(event) => updateField('address', event.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="link-instagram" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            Instagram handle{' '}
            <span className="font-normal normal-case text-[var(--color-text-tertiary)]">(without @)</span>
          </label>
          <input
            id="link-instagram"
            value={form.instagram_handle}
            onChange={(event) => updateField('instagram_handle', event.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="link-slug" className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            Link slug{' '}
            <span className="font-normal normal-case text-[var(--color-text-tertiary)]">(bislink.app/your-slug)</span>
          </label>
          <input
            id="link-slug"
            value={form.slug}
            onChange={(event) => updateField('slug', event.target.value.toLowerCase())}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
          />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button onClick={copyLink} className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white">
          Copy Link
        </button>
        <a href={`/${form.slug}`} className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-center text-sm font-semibold">
          Open Link
        </a>
        <button onClick={save} disabled={isPending} className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold disabled:opacity-60">
          {isPending ? 'Saving…' : 'Save Changes'}
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
    theme_key: business.theme_key,
    bio: business.bio,
    tagline: business.tagline ?? '',
    full_bio: business.full_bio ?? '',
    location: business.location ?? '',
    address: business.address ?? '',
    instagram_handle: business.instagram_handle ?? '',
    slug: business.slug
  };
}

function ThemeOptionCard({
  theme,
  selected,
  onSelect
}: {
  theme: BusinessThemeDefinition;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = themeIcons[theme.key];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-[22px] border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)] ${
        selected
          ? 'border-[var(--color-void)] shadow-[0_12px_30px_rgba(12,11,9,0.08)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-dark)]/30 hover:shadow-[0_8px_24px_rgba(12,11,9,0.05)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/30 bg-[image:var(--hero-gradient)] text-[var(--hero-text-1)] shadow-sm"
            style={theme.style}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{theme.label}</p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{theme.description}</p>
          </div>
        </div>
        <span
          className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border ${
            selected
              ? 'border-[var(--color-void)] bg-[var(--color-void)] text-white'
              : 'border-[var(--color-border)] text-transparent'
          }`}
        >
          <Check className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="mt-4 rounded-[18px] border border-[var(--color-border)] p-3" style={theme.style}>
        <div className="rounded-[16px] bg-[image:var(--hero-gradient)] px-3 py-3 text-[var(--hero-text-1)]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-[12px] bg-[linear-gradient(135deg,var(--gold),var(--gold-dark))]" />
            <div className="space-y-1">
              <div className="h-2 w-16 rounded-full bg-white/80" />
              <div className="h-2 w-10 rounded-full bg-white/35" />
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded-full bg-[var(--surface-3)]" />
            <div className="h-3 w-28 rounded-full bg-[var(--surface-2)]" />
          </div>
          <div className="rounded-full bg-[var(--void)] px-3 py-1 text-[10px] font-semibold text-white">
            Book
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">{theme.audience}</p>
    </button>
  );
}
