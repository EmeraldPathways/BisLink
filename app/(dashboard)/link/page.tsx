import { LinkEditor } from '@/components/dashboard/LinkEditor';
import { PublicPage } from '@/components/public/PublicPage';
import { getLinkData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { business, publicPage } = await getLinkData();

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-5xl">My Link</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Customize the public page, contact details, story, and trust
            sections.
          </p>
        </div>
        <LinkEditor business={business} />
      </div>
      <div className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-white">
        <PublicPage
          business={publicPage.business}
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
