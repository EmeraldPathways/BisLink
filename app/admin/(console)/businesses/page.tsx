import Link from 'next/link';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { requireAdminUser } from '@/lib/admin';
import { getAdminBusinessesData } from '@/lib/admin-console-data';

export const dynamic = 'force-dynamic';

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  await requireAdminUser();
  const { businesses, search } = await getAdminBusinessesData(searchParams?.q);

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="Businesses"
        description="Search every live business, inspect onboarding state, and jump into the records that need attention."
      />

      <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
        <form className="flex gap-3">
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search by business, slug, category, or owner email"
            className="flex-1 rounded-2xl border border-[var(--color-border)] px-4 py-3"
          />
          <button
            type="submit"
            className="rounded-2xl bg-[var(--color-void)] px-5 py-3 text-sm font-semibold text-white"
          >
            Search
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
        <div className="grid gap-4">
          {businesses.map((business) => (
            <Link
              key={business.id}
              href={`/admin/businesses/${business.id}`}
              className="rounded-[22px] border border-[var(--color-border)] p-5 transition-colors hover:bg-[var(--color-surface-2)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">
                    {business.category}
                  </p>
                  <h2 className="mt-2 font-display text-4xl">
                    {business.name}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    /{business.slug} • {business.ownerEmail}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
                  <span className="rounded-full bg-[var(--color-surface-2)] px-3 py-1">
                    {business.is_active ? 'active' : 'inactive'}
                  </span>
                  <span className="rounded-full bg-[var(--color-surface-2)] px-3 py-1">
                    {business.stripe_onboarded
                      ? 'stripe ready'
                      : 'stripe missing'}
                  </span>
                  <span className="rounded-full bg-[var(--color-surface-2)] px-3 py-1">
                    {business.latestActivityAt
                      ? 'live activity'
                      : 'no activity'}
                  </span>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <Metric
                  label="Services"
                  value={String(business.counts.services)}
                />
                <Metric
                  label="Products"
                  value={String(business.counts.products)}
                />
                <Metric
                  label="Reviews"
                  value={String(business.counts.reviews)}
                />
                <Metric
                  label="Latest activity"
                  value={
                    business.latestActivityAt
                      ? new Date(business.latestActivityAt).toLocaleDateString()
                      : 'No activity'
                  }
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-[var(--color-surface-2)] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
