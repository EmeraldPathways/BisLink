'use client';

import { useEffect, useState } from 'react';
import { LinkEditor } from '@/components/dashboard/LinkEditor';
import { PublicPage } from '@/components/public/PublicPage';
import type { PublicPageData } from '@/types';

export function LinkWorkspace({ publicPage }: { publicPage: PublicPageData }) {
  const [previewBusiness, setPreviewBusiness] = useState(publicPage.business);
  const [previewPortfolioItems, setPreviewPortfolioItems] = useState(publicPage.portfolioItems);

  useEffect(() => {
    setPreviewBusiness(publicPage.business);
    setPreviewPortfolioItems(publicPage.portfolioItems);
  }, [publicPage]);

  return (
    <div className="grid gap-6 xl:grid-cols-[520px_minmax(0,1fr)] 2xl:grid-cols-[560px_minmax(0,1fr)]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-5xl">My Link</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Customize your public page, brand, media, contact details, story, trust sections, and theme.
          </p>
        </div>

        <LinkEditor
          business={previewBusiness}
          portfolioItems={previewPortfolioItems}
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
