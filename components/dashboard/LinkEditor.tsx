'use client';

import type { ReactNode } from 'react';
import { Check, Dumbbell, Flame, Flower2, Newspaper, Sparkles, Zap } from 'lucide-react';
import { ImageUploadField } from '@/components/dashboard/ImageUploadField';
import { PortfolioEditor } from '@/components/dashboard/PortfolioEditor';
import type {
  LinkEditorMode,
  MobileEditSection
} from '@/components/dashboard/link-editor-sections';
import { FONT_PAIRINGS } from '@/lib/business-brand-overrides';
import { BUSINESS_THEMES, type BusinessThemeDefinition } from '@/lib/business-themes';
import type { BusinessProfile, BusinessThemeKey, PortfolioItemRecord } from '@/types';

export type LinkEditorFormState = {
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
  bookings_image_url: string;
  bookings_title: string;
  bookings_subtitle: string;
  products_image_url: string;
  products_title: string;
  products_subtitle: string;
  about_image_url: string;
  about_title: string;
  about_subtitle: string;
  contact_image_url: string;
  contact_title: string;
  contact_subtitle: string;
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

export type LinkDesktopSection =
  | 'settings'
  | 'hero'
  | 'announcement'
  | 'portfolio'
  | 'about'
  | 'contact';

export const LINK_DESKTOP_EDITOR_TABS: Array<{
  id: LinkDesktopSection;
  label: string;
}> = [
  { id: 'settings', label: 'Link Settings' },
  { id: 'hero', label: 'Hero' },
  { id: 'announcement', label: 'Announcement' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'about', label: 'About & Trust' },
  { id: 'contact', label: 'Contact & Social' }
];

const themeIcons: Record<BusinessThemeKey, typeof Sparkles> = {
  'classic-luxe': Sparkles,
  'wellness-studio': Flower2,
  'bright-performance': Dumbbell,
  'editorial-minimal': Newspaper,
  'warm-studio': Flame,
  'dark-athletic': Zap
};

const themeGroups = ['Editorial', 'Studio', 'Performance'] as const;

export function buildFormState(business: BusinessProfile): LinkEditorFormState {
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
    bookings_image_url: business.bookings_image_url ?? '',
    bookings_title: business.bookings_title ?? '',
    bookings_subtitle: business.bookings_subtitle ?? '',
    products_image_url: business.products_image_url ?? '',
    products_title: business.products_title ?? '',
    products_subtitle: business.products_subtitle ?? '',
    about_image_url: business.about_image_url ?? '',
    about_title: business.about_title ?? '',
    about_subtitle: business.about_subtitle ?? '',
    contact_image_url: business.contact_image_url ?? '',
    contact_title: business.contact_title ?? '',
    contact_subtitle: business.contact_subtitle ?? '',
    primary_cta_label: business.primary_cta_label ?? '',
    announcement_enabled: Boolean(business.announcement_enabled),
    announcement_text: business.announcement_text ?? '',
    custom_primary_color: business.custom_primary_color ?? '',
    custom_font_pairing:
      (business.custom_font_pairing as LinkEditorFormState['custom_font_pairing']) ??
      'theme-default',
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

export function toPreviewBusiness(
  base: BusinessProfile,
  form: LinkEditorFormState
): BusinessProfile {
  return {
    ...base,
    ...form,
    years_experience: form.years_experience ? Number(form.years_experience) : null
  };
}

export function toPortfolioPayload(item: PortfolioItemRecord, sortOrder: number) {
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
  mode = 'link',
  form,
  portfolioItems,
  isPending,
  message,
  error,
  section,
  desktopSection,
  onFieldChange,
  onPortfolioItemsChange,
  onSave,
  onCopyLink
}: {
  mode?: LinkEditorMode;
  form: LinkEditorFormState;
  portfolioItems: PortfolioItemRecord[];
  isPending: boolean;
  message: string | null;
  error: string | null;
  section?: MobileEditSection;
  desktopSection?: LinkDesktopSection;
  onFieldChange: <K extends keyof LinkEditorFormState>(
    key: K,
    value: LinkEditorFormState[K]
  ) => void;
  onPortfolioItemsChange: (items: PortfolioItemRecord[]) => void;
  onSave: () => void;
  onCopyLink: () => void;
}) {
  const isSingleSection = Boolean(section);
  const showInlineSaveAction = isSingleSection || Boolean(desktopSection);
  const saveLabel =
    mode === 'theme' ? 'Save Theme Settings' : 'Save Changes';

  const heroSection = (
    <EditorSection title="Hero">
      <ImageUploadField
        label="Profile photo"
        description="Shown as the main circular photo."
        value={form.photo_url}
        kind="profile"
        onChange={(url) => onFieldChange('photo_url', url)}
      />
      <ImageUploadField
        label="Cover image"
        description="Shown behind the hero content."
        value={form.cover_image_url}
        kind="cover"
        aspectHint="16:9 image required. CTA fallback: Book a Session. Cover fallback: selected theme background."
        onChange={(url) => onFieldChange('cover_image_url', url)}
      />
      <FormInput
        label="Business name"
        value={form.name}
        onChange={(value) => onFieldChange('name', value)}
      />
      <FormInput
        label="Category"
        value={form.category}
        onChange={(value) => onFieldChange('category', value)}
      />
      <FormTextArea
        label="Tagline"
        value={form.tagline}
        onChange={(value) => onFieldChange('tagline', value)}
      />
      <FormTextArea
        label="Short bio"
        value={form.bio}
        onChange={(value) => onFieldChange('bio', value)}
      />
      <FormInput
        label="Primary CTA label"
        value={form.primary_cta_label}
        onChange={(value) => onFieldChange('primary_cta_label', value)}
      />
      <SectionHeroFields
        prefix="bookings"
        title="Bookings hero"
        imageValue={form.bookings_image_url}
        titleValue={form.bookings_title}
        subtitleValue={form.bookings_subtitle}
        onFieldChange={onFieldChange}
      />
      <SectionHeroFields
        prefix="products"
        title="Shop hero"
        imageValue={form.products_image_url}
        titleValue={form.products_title}
        subtitleValue={form.products_subtitle}
        onFieldChange={onFieldChange}
      />
      {showInlineSaveAction ? (
        <SaveActionButton onSave={onSave} isPending={isPending} label={saveLabel} />
      ) : null}
    </EditorSection>
  );

  const announcementSection = (
    <EditorSection title="Announcement Bar">
      <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
        <input
          type="checkbox"
          checked={form.announcement_enabled}
          onChange={(event) =>
            onFieldChange('announcement_enabled', event.target.checked)
          }
        />
        Show announcement
      </label>
      <FormTextArea
        label="Announcement text"
        value={form.announcement_text}
        onChange={(value) => onFieldChange('announcement_text', value)}
      />
      {showInlineSaveAction ? (
        <SaveActionButton onSave={onSave} isPending={isPending} label={saveLabel} />
      ) : null}
    </EditorSection>
  );

  const portfolioSection = (
    <EditorSection
      title="Portfolio"
      description="Add up to 6 images, results, client work, Reels, TikToks or video links."
    >
      <PortfolioEditor items={portfolioItems} onChange={onPortfolioItemsChange} />
      {showInlineSaveAction ? (
        <SaveActionButton onSave={onSave} isPending={isPending} label={saveLabel} />
      ) : null}
    </EditorSection>
  );

  const aboutSection = (
    <EditorSection title="About & Trust" description="Example: Clients Helped / 200+">
      <SectionHeroFields
        prefix="about"
        title="About hero"
        imageValue={form.about_image_url}
        titleValue={form.about_title}
        subtitleValue={form.about_subtitle}
        onFieldChange={onFieldChange}
      />
      <FormTextArea
        label="Full bio"
        value={form.full_bio}
        onChange={(value) => onFieldChange('full_bio', value)}
      />
      <FormInput
        label="Years experience"
        value={form.years_experience}
        onChange={(value) => onFieldChange('years_experience', value)}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <FormInput
          label="Stat 1 label"
          value={form.stat_one_label}
          onChange={(value) => onFieldChange('stat_one_label', value)}
        />
        <FormInput
          label="Stat 1 value"
          value={form.stat_one_value}
          onChange={(value) => onFieldChange('stat_one_value', value)}
        />
        <FormInput
          label="Stat 2 label"
          value={form.stat_two_label}
          onChange={(value) => onFieldChange('stat_two_label', value)}
        />
        <FormInput
          label="Stat 2 value"
          value={form.stat_two_value}
          onChange={(value) => onFieldChange('stat_two_value', value)}
        />
        <FormInput
          label="Stat 3 label"
          value={form.stat_three_label}
          onChange={(value) => onFieldChange('stat_three_label', value)}
        />
        <FormInput
          label="Stat 3 value"
          value={form.stat_three_value}
          onChange={(value) => onFieldChange('stat_three_value', value)}
        />
      </div>
      <FormInput
        label="Google review URL"
        value={form.google_review_url}
        onChange={(value) => onFieldChange('google_review_url', value)}
      />
      {showInlineSaveAction ? (
        <SaveActionButton onSave={onSave} isPending={isPending} label={saveLabel} />
      ) : null}
    </EditorSection>
  );

  const contactSection = (
    <EditorSection title="Contact & Social Links">
      <SectionHeroFields
        prefix="contact"
        title="Contact hero"
        imageValue={form.contact_image_url}
        titleValue={form.contact_title}
        subtitleValue={form.contact_subtitle}
        onFieldChange={onFieldChange}
      />
      <FormInput
        label="Location"
        value={form.location}
        onChange={(value) => onFieldChange('location', value)}
      />
      <FormInput
        label="Full address"
        value={form.address}
        onChange={(value) => onFieldChange('address', value)}
      />
      <FormInput
        label="Email"
        value={form.email}
        onChange={(value) => onFieldChange('email', value)}
      />
      <FormInput
        label="Phone"
        value={form.phone}
        onChange={(value) => onFieldChange('phone', value)}
      />
      <FormInput
        label="WhatsApp number"
        value={form.whatsapp_number}
        onChange={(value) => onFieldChange('whatsapp_number', value)}
      />
      <FormInput
        label="Website URL"
        value={form.website_url}
        onChange={(value) => onFieldChange('website_url', value)}
      />
      <FormInput
        label="Instagram handle"
        value={form.instagram_handle}
        onChange={(value) => onFieldChange('instagram_handle', value)}
      />
      <FormInput
        label="TikTok handle"
        value={form.tiktok_handle}
        onChange={(value) => onFieldChange('tiktok_handle', value)}
      />
      <FormInput
        label="YouTube URL"
        value={form.youtube_url}
        onChange={(value) => onFieldChange('youtube_url', value)}
      />
      {showInlineSaveAction ? (
        <SaveActionButton onSave={onSave} isPending={isPending} label={saveLabel} />
      ) : null}
    </EditorSection>
  );

  const settingsSection = (
    <EditorSection title="Link Settings">
      <FormInput
        label="Slug"
        value={form.slug}
        onChange={(value) => onFieldChange('slug', value.toLowerCase())}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={onCopyLink}
          className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white"
        >
          Copy Link
        </button>
        <a
          href={`/${form.slug}`}
          className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-center text-sm font-semibold"
        >
          Open Link
        </a>
        <SaveActionButton onSave={onSave} isPending={isPending} label={saveLabel} />
      </div>
    </EditorSection>
  );

  const presetSection = (
    <EditorSection title="Theme Preset">
      <div className="space-y-4">
        {themeGroups.map((group) => {
          const options = BUSINESS_THEMES.filter(
            (theme) => theme.preview.group === group
          );
          if (!options.length) return null;

          return (
            <section key={group} className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                {group}
              </p>
              <div className="grid grid-cols-2 gap-2 xl:gap-3">
                {options.map((theme) => (
                  <ThemeOptionCard
                    key={theme.key}
                    theme={theme}
                    selected={form.theme_key === theme.key}
                    onSelect={() => onFieldChange('theme_key', theme.key)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {isSingleSection ? (
        <SaveActionButton onSave={onSave} isPending={isPending} label={saveLabel} />
      ) : null}
    </EditorSection>
  );

  const brandSection = (
    <EditorSection title="Brand Styling">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            Primary colour
          </label>
          <input
            type="color"
            value={form.custom_primary_color || '#000000'}
            onChange={(event) =>
              onFieldChange('custom_primary_color', event.target.value)
            }
            className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-white p-2"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            Hex
          </label>
          <input
            value={form.custom_primary_color}
            onChange={(event) =>
              onFieldChange('custom_primary_color', event.target.value)
            }
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3"
            placeholder="#RRGGBB"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onFieldChange('custom_primary_color', '')}
          className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold"
        >
          Use theme colour
        </button>
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
          Font pairing
        </label>
        <select
          value={form.custom_font_pairing}
          onChange={(event) =>
            onFieldChange(
              'custom_font_pairing',
              event.target.value as LinkEditorFormState['custom_font_pairing']
            )
          }
          className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3"
        >
          {Object.entries(FONT_PAIRINGS).map(([key, value]) => (
            <option key={key} value={key}>
              {value?.label ?? 'Theme Default'}
            </option>
          ))}
        </select>
      </div>
      {isSingleSection ? (
        <SaveActionButton onSave={onSave} isPending={isPending} label={saveLabel} />
      ) : null}
    </EditorSection>
  );

  const themeSaveSection = (
    <EditorSection title="Theme Settings">
      <SaveActionButton onSave={onSave} isPending={isPending} label={saveLabel} />
    </EditorSection>
  );

  const sectionContent = {
    hero: heroSection,
    announcement: announcementSection,
    portfolio: portfolioSection,
    about: aboutSection,
    contact: contactSection,
    settings: settingsSection,
    preset: presetSection,
    brand: brandSection,
    save: themeSaveSection
  } satisfies Record<MobileEditSection, ReactNode>;

  const desktopLinkContent = {
    settings: settingsSection,
    hero: heroSection,
    announcement: announcementSection,
    portfolio: portfolioSection,
    about: aboutSection,
    contact: contactSection
  } satisfies Record<LinkDesktopSection, ReactNode>;

  const singleSectionContent = section ? sectionContent[section] : null;

  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <div className="space-y-6">
        {isSingleSection ? (
          singleSectionContent
        ) : mode === 'link' && desktopSection ? (
          desktopLinkContent[desktopSection]
        ) : mode === 'theme' ? (
          <>
            {presetSection}
            {brandSection}
            {themeSaveSection}
          </>
        ) : (
          <>
            {heroSection}
            {announcementSection}
            {portfolioSection}
            {aboutSection}
            {contactSection}
            {settingsSection}
          </>
        )}
      </div>
      {message ? <p className="mt-4 text-xs text-green-700">{message}</p> : null}
      {error ? <p className="mt-4 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function EditorSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-[24px] border border-[var(--color-border)] p-4">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FormInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3"
      />
    </div>
  );
}

function FormTextArea({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[100px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3"
      />
    </div>
  );
}

function SectionHeroFields({
  prefix,
  title,
  imageValue,
  titleValue,
  subtitleValue,
  onFieldChange
}: {
  prefix: 'bookings' | 'products' | 'about' | 'contact';
  title: string;
  imageValue: string;
  titleValue: string;
  subtitleValue: string;
  onFieldChange: <K extends keyof LinkEditorFormState>(
    key: K,
    value: LinkEditorFormState[K]
  ) => void;
}) {
  return (
    <div className="space-y-3 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">16:9 image, custom title, and custom subtitle for this public-page section.</p>
      </div>
      <ImageUploadField
        label={`${title} image`}
        value={imageValue}
        kind="cover"
        aspectHint="16:9 image required."
        onChange={(url) => onFieldChange(`${prefix}_image_url` as keyof LinkEditorFormState, url as LinkEditorFormState[keyof LinkEditorFormState])}
      />
      <FormInput
        label={`${title} title`}
        value={titleValue}
        onChange={(value) => onFieldChange(`${prefix}_title` as keyof LinkEditorFormState, value as LinkEditorFormState[keyof LinkEditorFormState])}
      />
      <FormTextArea
        label={`${title} subtitle`}
        value={subtitleValue}
        onChange={(value) => onFieldChange(`${prefix}_subtitle` as keyof LinkEditorFormState, value as LinkEditorFormState[keyof LinkEditorFormState])}
      />
    </div>
  );
}

function SaveActionButton({
  onSave,
  isPending,
  label
}: {
  onSave: () => void;
  isPending: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={isPending}
      className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold disabled:opacity-60"
    >
      {isPending ? 'Saving...' : label}
    </button>
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
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/30 bg-[image:var(--hero-gradient)] text-[var(--hero-text-1)] shadow-sm xl:h-10 xl:w-10"
            style={theme.style}
          >
            <Icon className="h-4 w-4 xl:h-[18px] xl:w-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)] xl:text-[14px]">
              {theme.label}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-secondary)] xl:text-[12px]">
              {theme.description}
            </p>
          </div>
        </div>
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border xl:h-5 xl:w-5 ${
            selected
              ? 'border-[var(--color-void)] bg-[var(--color-void)] text-white'
              : 'border-[var(--color-border)] text-transparent'
          }`}
        >
          <Check className="h-3 w-3" />
        </span>
      </div>
    </button>
  );
}
