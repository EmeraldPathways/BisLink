import { PublicPage } from '@/components/public/PublicPage';
import { getLinkData } from '@/lib/dashboard-data';

export default async function Page() {
  const { business, publicPage } = await getLinkData();

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-5xl">My Link</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Customize the public page, contact details, story, and trust sections.</p>
        </div>
        <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
          <div className="space-y-3">
            <input readOnly className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface-2)]" defaultValue={business.name} />
            <input readOnly className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface-2)]" defaultValue={business.category} />
            <textarea readOnly className="min-h-[100px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface-2)]" defaultValue={business.bio} />
            <input readOnly className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface-2)]" defaultValue={business.tagline ?? ''} />
            <textarea readOnly className="min-h-[140px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface-2)]" defaultValue={business.full_bio ?? ''} />
            <input readOnly className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface-2)]" defaultValue={business.location ?? ''} />
            <input readOnly className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface-2)]" defaultValue={business.address ?? ''} />
            <input readOnly className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface-2)]" defaultValue={business.instagram_handle ?? ''} />
            <input readOnly className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface-2)]" defaultValue={business.slug} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <button disabled className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white opacity-60">Copy Link</button>
            <a href={`/${business.slug}`} className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-center text-sm font-semibold">Open Link</a>
            <button disabled className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold opacity-60">Download QR</button>
          </div>
          <p className="mt-4 text-xs text-[var(--color-text-secondary)]">Link editing and sharing actions move to Phase 2. The preview is now live data.</p>
        </div>
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
