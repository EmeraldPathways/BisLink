'use client';

import { useMemo, useState } from 'react';
import { LinkEditor } from '@/components/dashboard/LinkEditor';
import { PublicPage } from '@/components/public/PublicPage';
import type { PublicPageData } from '@/types';

export function LinkWorkspace({ publicPage }: { publicPage: PublicPageData }) {
  const [previewThemeKey, setPreviewThemeKey] = useState(publicPage.business.theme_key);

  const previewBusiness = useMemo(
    () => ({
      ...publicPage.business,
      theme_key: previewThemeKey
    }),
    [previewThemeKey, publicPage.business]
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-5xl">My Link</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Customize the public page, contact details, story, trust sections,
            and theme.
          </p>
        </div>
        <LinkEditor business={publicPage.business} onThemePreviewChange={setPreviewThemeKey} />
      </div>
      <div className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-white">
        <PublicPage
          business={previewBusiness}
          services={publicPage.services}
          products={publicPage.products}
          reviews={publicPage.reviews}
          credentials={publicPage.credentials}
          specialisms={publicPage.specialisms}
        />
      </div>
    </div>
  );
}
