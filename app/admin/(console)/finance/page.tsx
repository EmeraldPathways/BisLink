import Link from 'next/link';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { requireAdminUser } from '@/lib/admin';
import { getAdminFinanceData } from '@/lib/admin-console-data';
import { formatPrice } from '@/lib/utils/formatting';

export const dynamic = 'force-dynamic';

export default async function AdminFinancePage() {
  await requireAdminUser();
  const { totals, businessesNeedingAttention, topBusinesses } = await getAdminFinanceData();

  return (
    <div className="space-y-6">
      <AdminTopbar title="Finance" description="Track platform revenue, Stripe account readiness, payout flow, and the businesses that need financial intervention." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Week revenue" value={formatPrice(totals.weekRevenue)} />
        <Metric label="Month revenue" value={formatPrice(totals.monthRevenue)} />
        <Metric label="Connected accounts" value={String(totals.connectedAccounts)} />
        <Metric label="In-transit payouts" value={String(totals.inTransitPayouts)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
          <h2 className="font-display text-4xl">Top businesses this month</h2>
          <div className="mt-5 space-y-3">
            {topBusinesses.map((entry) => (
              <Link key={entry.business.id} href={`/admin/businesses/${entry.business.id}`} className="flex items-center justify-between rounded-[20px] border border-[var(--color-border)] p-4">
                <div>
                  <p className="text-sm font-semibold">{entry.business.name}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{entry.business.category}</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(entry.monthRevenue, entry.business.currency ?? 'USD')}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
          <h2 className="font-display text-4xl">Needs payout attention</h2>
          <div className="mt-5 space-y-3">
            {businessesNeedingAttention.map((business) => (
              <Link key={business.id} href={`/admin/businesses/${business.id}`} className="block rounded-[20px] border border-[var(--color-border)] p-4">
                <p className="text-sm font-semibold">{business.name}</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{business.stripe_onboarded ? 'Missing Stripe account data' : 'Stripe onboarding incomplete'}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-3 text-lg font-semibold">{value}</p>
    </div>
  );
}
