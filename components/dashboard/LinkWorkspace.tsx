'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  LinkEditor,
  buildFormState,
  toPortfolioPayload,
  toPreviewBusiness,
  type LinkEditorFormState
} from '@/components/dashboard/LinkEditor';
import { LinkMobileSheet } from '@/components/dashboard/LinkMobileSheet';
import {
  getMobileSectionMeta,
  type LinkEditorMode,
  type MobileEditSection
} from '@/components/dashboard/link-editor-sections';
import { PublicPage } from '@/components/public/PublicPage';
import { useIsMobile } from '@/hooks/useBreakpoint';
import type { PortfolioItemRecord, PublicPageData } from '@/types';

const workspaceCopy: Record<
  LinkEditorMode,
  { title: string; description: string; mobileHint: string }
> = {
  link: {
    title: 'My Link',
    description:
      'Customize your public page content, media, story, trust sections, contact details, and link settings.',
    mobileHint: 'Tap a section in the preview to edit it.'
  },
  theme: {
    title: 'Theme Settings',
    description:
      'Control your theme preset, brand colour, and font pairing while previewing the public page live.',
    mobileHint: 'Tap the preview to adjust the theme and save it.'
  }
};

export function LinkWorkspace({
  publicPage,
  mode = 'link'
}: {
  publicPage: PublicPageData;
  mode?: LinkEditorMode;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [form, setForm] = useState(() => buildFormState(publicPage.business));
  const [draftPortfolioItems, setDraftPortfolioItems] = useState(publicPage.portfolioItems);
  const [activeMobileSection, setActiveMobileSection] =
    useState<MobileEditSection | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, startTransition] = useTransition();
  const isPending = isSaving || isRefreshing;
  const copy = workspaceCopy[mode];

  useEffect(() => {
    setForm(buildFormState(publicPage.business));
    setDraftPortfolioItems(publicPage.portfolioItems);
    setMessage(null);
    setError(null);
  }, [publicPage]);

  useEffect(() => {
    if (!isMobile) {
      setActiveMobileSection(null);
    }
  }, [isMobile]);

  const previewBusiness = useMemo(
    () => toPreviewBusiness(publicPage.business, form),
    [form, publicPage.business]
  );

  function updateField<K extends keyof LinkEditorFormState>(
    key: K,
    value: LinkEditorFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function syncPortfolioItems() {
    const activeCount = draftPortfolioItems.filter((item) => item.is_active).length;
    if (activeCount > 6) {
      throw new Error('You can only have 6 active portfolio items.');
    }

    const originalExistingItems = publicPage.portfolioItems.filter(
      (item) => !item.id.startsWith('temp-')
    );
    const currentExistingIds = new Set(
      draftPortfolioItems
        .filter((item) => !item.id.startsWith('temp-'))
        .map((item) => item.id)
    );
    const deletedItems = originalExistingItems.filter(
      (item) => !currentExistingIds.has(item.id)
    );

    for (const item of deletedItems) {
      const response = await fetch(`/api/owner/portfolio/${item.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
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
      const result = (await response.json().catch(() => null)) as
        | { item?: PortfolioItemRecord; error?: string }
        | null;
      if (!response.ok || !result?.item) {
        throw new Error(result?.error || 'Failed to create portfolio item');
      }
      createdMap.set(item.id, result.item);
    }

    const resolvedItems = draftPortfolioItems.map(
      (item) => createdMap.get(item.id) ?? item
    );
    setDraftPortfolioItems(resolvedItems);

    for (const [index, item] of resolvedItems.entries()) {
      const response = await fetch(`/api/owner/portfolio/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPortfolioPayload(item, index))
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to update portfolio item');
      }
    }
  }

  async function save() {
    setError(null);
    setMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch('/api/owner/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!response.ok) {
        throw new Error(result?.error ?? 'Failed to save link settings');
      }

      await syncPortfolioItems();
      setMessage('Saved');
      startTransition(() => {
        setActiveMobileSection(null);
        router.refresh();
      });
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Failed to save changes'
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/${form.slug}`);
    setMessage('Link copied');
  }

  const previewFrame = (
    <div className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-white">
      <PublicPage
        business={previewBusiness}
        services={publicPage.services}
        products={publicPage.products}
        reviews={publicPage.reviews}
        credentials={publicPage.credentials}
        specialisms={publicPage.specialisms}
        portfolioItems={draftPortfolioItems}
        ownerPreview={
          isMobile
            ? {
                mode,
                onEditSection: setActiveMobileSection
              }
            : undefined
        }
      />
    </div>
  );

  return (
    <>
      <div className="space-y-4 md:hidden">
        <div>
          <h1 className="font-display text-5xl">{copy.title}</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {copy.mobileHint}
          </p>
        </div>
        {previewFrame}
      </div>

      <div className="hidden gap-6 md:grid xl:grid-cols-[520px_minmax(0,1fr)] 2xl:grid-cols-[560px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-5xl">{copy.title}</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {copy.description}
            </p>
          </div>

          <LinkEditor
            form={form}
            portfolioItems={draftPortfolioItems}
            mode={mode}
            isPending={isPending}
            message={message}
            error={error}
            onFieldChange={updateField}
            onPortfolioItemsChange={setDraftPortfolioItems}
            onSave={save}
            onCopyLink={copyLink}
          />
        </div>

        {previewFrame}
      </div>

      <LinkMobileSheet
        open={Boolean(activeMobileSection)}
        title={
          activeMobileSection
            ? getMobileSectionMeta(activeMobileSection).title
            : copy.title
        }
        description={
          activeMobileSection
            ? getMobileSectionMeta(activeMobileSection).description
            : copy.description
        }
        onClose={() => setActiveMobileSection(null)}
      >
        {activeMobileSection ? (
          <LinkEditor
            form={form}
            portfolioItems={draftPortfolioItems}
            mode={mode}
            section={activeMobileSection}
            isPending={isPending}
            message={message}
            error={error}
            onFieldChange={updateField}
            onPortfolioItemsChange={setDraftPortfolioItems}
            onSave={save}
            onCopyLink={copyLink}
          />
        ) : null}
      </LinkMobileSheet>
    </>
  );
}
