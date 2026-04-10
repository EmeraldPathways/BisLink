import { PublicPage } from '@/components/public/PublicPage';
import {
  demoBusiness,
  demoCredentials,
  demoProducts,
  demoReviews,
  demoServices,
  demoSpecialisms
} from '@/lib/demo-data';

export default function Page() {
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-5xl">My Link</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Customize the public page, contact details, story, and trust sections.</p>
        </div>
        <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
          <div className="space-y-3">
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.name} />
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.category} />
            <textarea className="min-h-[100px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.bio} />
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.tagline ?? ''} />
            <textarea className="min-h-[140px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.full_bio ?? ''} />
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.location ?? ''} />
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.address ?? ''} />
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.instagram_handle ?? ''} />
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.slug} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <button className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white">Copy Link</button>
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold">Open Link</button>
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold">Download QR</button>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-white">
        <PublicPage
          business={demoBusiness}
          services={demoServices}
          products={demoProducts}
          reviews={demoReviews}
          credentials={demoCredentials}
          specialisms={demoSpecialisms}
        />
      </div>
    </div>
  );
}
