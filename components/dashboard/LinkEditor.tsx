'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { Check, Dumbbell, Flame, Flower2, Newspaper, Sparkles, Zap } from 'lucide-react';
import { ImageUploadField } from '@/components/dashboard/ImageUploadField';
import { PortfolioEditor } from '@/components/dashboard/PortfolioEditor';
import { FONT_PAIRINGS } from '@/lib/business-brand-overrides';
import { BUSINESS_THEMES, type BusinessThemeDefinition } from '@/lib/business-themes';
import type { BusinessProfile, BusinessThemeKey, PortfolioItemRecord } from '@/types';

type FormState = {
  name: string;
  category: string;
  theme_key: BusinessThemeKey;
  bio: string;
  tagline: string;
  full_bio: string;
  location: string;
  address: string;
  slug: string;
  photo_url: string;
  cover_image_url: string;
  primary_cta_label: string;
  announcement_enabled: boolean;
  announcement_text: string;
  custom_primary_color: string;
  custom_font_pairing: 'theme-default' | 'editorial' | 'modern' | 'friendly' | 'premium';
  website_url: string;
  instagram_handle: string;
  tiktok_handle: string;
  youtube_url: string;
  whatsapp_number: string;
  email: string;
  phone: string;
  google_review_url: string;
  years_experience: string;
  stat_one_label: string;
  stat_one_value: string;
  stat_two_label: string;
  stat_two_value: string;
  stat_three_label: string;
  stat_three_value: string;
};

const themeIcons: Record<BusinessThemeKey, typeof Sparkles> = {
  'classic-luxe': Sparkles,
  'wellness-studio': Flower2,
  'bright-performance': Dumbbell,
  'editorial-minimal': Newspaper,
  'warm-studio': Flame,
  'dark-athletic': Zap
};

const themeGroups = ['Editorial', 'Studio', 'Performance'] as const;

function toPreviewBusiness(base: BusinessProfile, form: FormState): BusinessProfile {
  return {
    ...base,
    ...form,
    years_experience: form.years_experience ? Number(form.years_experience) : null
  };
}

function toPortfolioPayload(item: PortfolioItemRecord, sortOrder: number) {
  return {
    title: item.title ?? '',
    description: item.description ?? '',
    media_type: item.media_type,
    image_url: item.image_url ?? '',
    external_url: item.external_url ?? '',
    sort_order: sortOrder,
    is_active: item.is_active
  };
}

export function LinkEditor({
  business,
  portfolioItems,
  onPreviewBusinessChange,
  onPreviewPortfolioChange
}: {
  business: BusinessProfile;
  portfolioItems: PortfolioItemRecord[];
  onPreviewBusinessChange?: (business: BusinessProfile) => void;
  onPreviewPortfolioChange?: (items: PortfolioItemRecord[]) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => buildFormState(business));
  const [draftPortfolioItems, setDraftPortfolioItems] = useState<PortfolioItemRecord[]>(portfolioItems);

  useEffect(() => {
    setForm(buildFormState(business));
  }, [business]);

  useEffect(() => {
    setDraftPortfolioItems(portfolioItems);
  }, [portfolioItems]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      onPreviewBusinessChange?.(toPreviewBusiness(business, next));
      return next;
    });
  }

  function updatePortfolioItems(nextItems: PortfolioItemRecord[]) {
    setDraftPortfolioItems(nextItems);
    onPreviewPortfolioChange?.(nextItems);
  }

  async function syncPortfolioItems() {
    const activeCount = draftPortfolioItems.filter((item) => item.is_active).length;
    if (activeCount > 6) {
      throw new Error('You can only have 6 active portfolio items.');
    }

    const originalExistingItems = portfolioItems.filter((item) => !item.id.startsWith('temp-'));
    const currentExistingIds = new Set(draftPortfolioItems.filter((item) => !item.id.startsWith('temp-')).map((item) => item.id));
    const deletedItems = originalExistingItems.filter((item) => !currentExistingIds.has(item.id));

    for (const item of deletedItems) {
      const response = await fetch(`/api/owner/portfolio/${item.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error || 'Failed to delete portfolio item');
      }
    }

    const createdMap = new Map<string, PortfolioItemRecord>();
    for (const [index, item] of draftPortfolioItems.entries()) {
      if (!item.id.startsWith('temp-')) continue;

      const response = await fetch('/api/owner/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPortfolioPayload(item, index))
      });
      const result = (await response.json().catch(() => null)) as { item?: PortfolioItemRecord; error?: string } | null;
      if (!response.ok || !result?.item) {
        throw new Error(result?.error || 'Failed to create portfolio item');
      }
      createdMap.set(item.id, result.item);
    }

    const resolvedItems = draftPortfolioItems.map((item) => createdMap.get(item.id) ?? item);

    for (const [index, item] of resolvedItems.entries()) {
      const response = await fetch(`/api/owner/portfolio/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPortfolioPayload(item, index))
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to update portfolio item');
      }
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

    try {
      await syncPortfolioItems();
      setMessage('Saved');
      startTransition(() => router.refresh());
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save portfolio changes');
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/${form.slug}`);
    setMessage('Link copied');
  }

  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <div className="space-y-6">
        <EditorSection title="Theme Preset">
          <div className="space-y-4">
            {themeGroups.map((group) => {
              const options = BUSINESS_THEMES.filter((theme) => theme.preview.group === group);
              if (!options.length) return null;

              return (
                <section key={group} className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">{group}</p>
                  <div className="grid grid-cols-2 gap-2 xl:gap-3">
                    {options.map((theme) => (
                      <ThemeOptionCard key={theme.key} theme={theme} selected={form.theme_key === theme.key} onSelect={() => updateField('theme_key', theme.key)} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </EditorSection>

        <EditorSection title="Brand Styling">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">Primary colour</label>
              <input type="color" value={form.custom_primary_color || '#000000'} onChange={(event) => updateField('custom_primary_color', event.target.value)} className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-white p-2" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">Hex</label>
              <input value={form.custom_primary_color} onChange={(event) => updateField('custom_primary_color', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="#RRGGBB" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => updateField('custom_primary_color', '')} className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold">
              Use theme colour
            </button>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">Font pairing</label>
            <select value={form.custom_font_pairing} onChange={(event) => updateField('custom_font_pairing', event.target.value as FormState['custom_font_pairing'])} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3">
              {Object.entries(FONT_PAIRINGS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value?.label ?? 'Theme Default'}
                </option>
              ))}
            </select>
          </div>
        </EditorSection>

        <EditorSection title="Hero">
          <ImageUploadField label="Profile photo" description="Shown as the main circular photo." value={form.photo_url} kind="profile" onChange={(url) => updateField('photo_url', url)} />
          <ImageUploadField label="Cover image" description="Shown behind the hero content." value={form.cover_image_url} kind="cover" aspectHint="CTA fallback: Book a Session. Cover fallback: selected theme background." onChange={(url) => updateField('cover_image_url', url)} />
          <FormInput label="Business name" value={form.name} onChange={(value) => updateField('name', value)} />
          <FormInput label="Category" value={form.category} onChange={(value) => updateField('category', value)} />
          <FormTextArea label="Tagline" value={form.tagline} onChange={(value) => updateField('tagline', value)} />
          <FormTextArea label="Short bio" value={form.bio} onChange={(value) => updateField('bio', value)} />
          <FormInput label="Primary CTA label" value={form.primary_cta_label} onChange={(value) => updateField('primary_cta_label', value)} />
        </EditorSection>

        <EditorSection title="Announcement Bar">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
            <input type="checkbox" checked={form.announcement_enabled} onChange={(event) => updateField('announcement_enabled', event.target.checked)} />
            Show announcement
          </label>
          <FormTextArea label="Announcement text" value={form.announcement_text} onChange={(value) => updateField('announcement_text', value)} />
        </EditorSection>

        <EditorSection title="Portfolio" description="Add up to 6 images, results, client work, Reels, TikToks or video links.">
          <PortfolioEditor items={draftPortfolioItems} onChange={updatePortfolioItems} />
        </EditorSection>

        <EditorSection title="About & Trust" description="Example: Clients Helped / 200+">
          <FormTextArea label="Full bio" value={form.full_bio} onChange={(value) => updateField('full_bio', value)} />
          <FormInput label="Years experience" value={form.years_experience} onChange={(value) => updateField('years_experience', value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormInput label="Stat 1 label" value={form.stat_one_label} onChange={(value) => updateField('stat_one_label', value)} />
            <FormInput label="Stat 1 value" value={form.stat_one_value} onChange={(value) => updateField('stat_one_value', value)} />
            <FormInput label="Stat 2 label" value={form.stat_two_label} onChange={(value) => updateField('stat_two_label', value)} />
            <FormInput label="Stat 2 value" value={form.stat_two_value} onChange={(value) => updateField('stat_two_value', value)} />
            <FormInput label="Stat 3 label" value={form.stat_three_label} onChange={(value) => updateField('stat_three_label', value)} />
            <FormInput label="Stat 3 value" value={form.stat_three_value} onChange={(value) => updateField('stat_three_value', value)} />
          </div>
          <FormInput label="Google review URL" value={form.google_review_url} onChange={(value) => updateField('google_review_url', value)} />
        </EditorSection>

        <EditorSection title="Contact & Social Links">
          <FormInput label="Location" value={form.location} onChange={(value) => updateField('location', value)} />
          <FormInput label="Full address" value={form.address} onChange={(value) => updateField('address', value)} />
          <FormInput label="Email" value={form.email} onChange={(value) => updateField('email', value)} />
          <FormInput label="Phone" value={form.phone} onChange={(value) => updateField('phone', value)} />
          <FormInput label="WhatsApp number" value={form.whatsapp_number} onChange={(value) => updateField('whatsapp_number', value)} />
          <FormInput label="Website URL" value={form.website_url} onChange={(value) => updateField('website_url', value)} />
          <FormInput label="Instagram handle" value={form.instagram_handle} onChange={(value) => updateField('instagram_handle', value)} />
          <FormInput label="TikTok handle" value={form.tiktok_handle} onChange={(value) => updateField('tiktok_handle', value)} />
          <FormInput label="YouTube URL" value={form.youtube_url} onChange={(value) => updateField('youtube_url', value)} />
        </EditorSection>

        <EditorSection title="Link Settings">
          <FormInput label="Slug" value={form.slug} onChange={(value) => updateField('slug', value.toLowerCase())} />
          <div className="grid gap-3 sm:grid-cols-3">
            <button onClick={copyLink} className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white">
              Copy Link
            </button>
            <a href={`/${form.slug}`} className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-center text-sm font-semibold">
              Open Link
            </a>
            <button onClick={save} disabled={isPending} className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold disabled:opacity-60">
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </EditorSection>
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
    slug: business.slug,
    photo_url: business.photo_url ?? '',
    cover_image_url: business.cover_image_url ?? '',
    primary_cta_label: business.primary_cta_label ?? '',
    announcement_enabled: Boolean(business.announcement_enabled),
    announcement_text: business.announcement_text ?? '',
    custom_primary_color: business.custom_primary_color ?? '',
    custom_font_pairing: (business.custom_font_pairing as FormState['custom_font_pairing']) ?? 'theme-default',
    website_url: business.website_url ?? '',
    instagram_handle: business.instagram_handle ?? '',
    tiktok_handle: business.tiktok_handle ?? '',
    youtube_url: business.youtube_url ?? '',
    whatsapp_number: business.whatsapp_number ?? '',
    email: business.email ?? '',
    phone: business.phone ?? '',
    google_review_url: business.google_review_url ?? '',
    years_experience: business.years_experience ? String(business.years_experience) : '',
    stat_one_label: business.stat_one_label ?? '',
    stat_one_value: business.stat_one_value ?? '',
    stat_two_label: business.stat_two_label ?? '',
    stat_two_value: business.stat_two_value ?? '',
    stat_three_label: business.stat_three_label ?? '',
    stat_three_value: business.stat_three_value ?? ''
  };
}

function EditorSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-[24px] border border-[var(--color-border)] p-4">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function FormInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
    </div>
  );
}

function FormTextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">{label}</label>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[100px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3" />
    </div>
  );
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
      className={`rounded-[18px] border p-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)] xl:rounded-[20px] xl:p-3 ${
        selected
          ? 'border-[var(--color-void)] bg-[var(--color-surface)] shadow-[0_8px_20px_rgba(12,11,9,0.08)]'
          : 'border-[var(--color-border)] bg-white hover:border-[var(--color-border-dark)] hover:shadow-[0_6px_16px_rgba(12,11,9,0.05)]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/30 bg-[image:var(--hero-gradient)] text-[var(--hero-text-1)] shadow-sm xl:h-10 xl:w-10" style={theme.style}>
            <Icon className="h-4 w-4 xl:h-[18px] xl:w-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)] xl:text-[14px]">{theme.label}</p>
            <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-secondary)] xl:text-[12px]">{theme.description}</p>
          </div>
        </div>
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border xl:h-5 xl:w-5 ${selected ? 'border-[var(--color-void)] bg-[var(--color-void)] text-white' : 'border-[var(--color-border)] text-transparent'}`}>
          <Check className="h-3 w-3" />
        </span>
      </div>
    </button>
  );
}
