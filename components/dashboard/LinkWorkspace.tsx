'use client';

import { useEffect, useState } from 'react';
import { LinkEditor } from '@/components/dashboard/LinkEditor';
import { PublicPage } from '@/components/public/PublicPage';
import type { PublicPageData } from '@/types';

export type LinkWorkspaceMode = 'link' | 'theme';

const workspaceCopy: Record<
  LinkWorkspaceMode,
  { title: string; description: string }
> = {
  link: {
    title: 'My Link',
    description:
      'Customize your public page content, media, story, trust sections, contact details, and link settings.'
  },
  theme: {
    title: 'Theme Settings',
    description:
      'Control your theme preset, brand colour, and font pairing while previewing the public page live.'
  }
};

export function LinkWorkspace({
  publicPage,
  mode = 'link'
}: {
  publicPage: PublicPageData;
  mode?: LinkWorkspaceMode;
}) {
  const [previewBusiness, setPreviewBusiness] = useState(publicPage.business);
  const [previewPortfolioItems, setPreviewPortfolioItems] = useState(publicPage.portfolioItems);
  const copy = workspaceCopy[mode];

  useEffect(() => {
    setPreviewBusiness(publicPage.business);
    setPreviewPortfolioItems(publicPage.portfolioItems);
  }, [publicPage]);

  return (
    <div className="grid gap-6 xl:grid-cols-[520px_minmax(0,1fr)] 2xl:grid-cols-[560px_minmax(0,1fr)]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-5xl">{copy.title}</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {copy.description}
          </p>
        </div>

        <LinkEditor
          business={previewBusiness}
          portfolioItems={previewPortfolioItems}
          mode={mode}
          onPreviewBusinessChange={setPreviewBusiness}
          onPreviewPortfolioChange={setPreviewPortfolioItems}
        />
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-white">
        <PublicPage
          business={previewBusiness}
          services={publicPage.services}
          products={publicPage.products}
          reviews={publicPage.reviews}
          credentials={publicPage.credentials}
          specialisms={publicPage.specialisms}
          portfolioItems={previewPortfolioItems}
        />
      </div>
    </div>
  );
}
