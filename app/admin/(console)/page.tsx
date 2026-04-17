import { AdminMetricGrid } from '@/components/admin/AdminMetricGrid';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { requireAdminUser } from '@/lib/admin';
import { getAdminOverviewData } from '@/lib/admin-console-data';
import { formatPrice } from '@/lib/utils/formatting';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  await requireAdminUser();
  const { metrics: overview, health, diagnostics } = await getAdminOverviewData();
  const metrics = [
    { label: 'Businesses', value: String(overview.totalBusinesses) },
    { label: 'Customers', value: String(overview.totalCustomers) },
    { label: 'Monthly revenue', value: formatPrice(overview.monthlyRevenue) },
    { label: 'In-transit payouts', value: String(overview.inTransitPayouts) }
  ];

  return (
    <div className="space-y-6">
      <AdminTopbar title="Admin overview" description="Operational visibility for BisLink itself: platform health, rollout status, and the systems behind the owner experience." />

      <AdminMetricGrid metrics={metrics} />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
          <h2 className="font-display text-4xl">Platform snapshot</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ['Active businesses', String(overview.activeBusinesses)],
              ['Stripe onboarded', String(overview.stripeReadyBusinesses)],
              ['Stripe missing', String(overview.stripeMissingBusinesses)],
              ['Recent bookings', String(overview.recentBookings)],
              ['Recent orders', String(overview.recentOrders)],
              ['Needs review', String(overview.unpublishedReviews)]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[20px] bg-[var(--color-surface-2)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">{label}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
          <h2 className="font-display text-4xl">System health</h2>
          <div className="mt-5 space-y-3">
            {health.map((item) => (
              <div key={item.label} className="rounded-[20px] border border-[var(--color-border)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                      item.tone === 'success'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.tone === 'warning'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
        <h2 className="font-display text-4xl">Agent diagnostics</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Last check: {new Date(diagnostics.timestamp).toLocaleString()}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {diagnostics.checks.map((check) => (
            <div key={check.name} className="rounded-[20px] border border-[var(--color-border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{check.label}</p>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                    check.level === 'ok' ? 'bg-emerald-50 text-emerald-700' : check.level === 'warn' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {check.state}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{check.summary}</p>
              {check.details ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(check.details).map(([key, value]) => (
                    <span key={key} className="rounded-full bg-[var(--color-surface-2)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                      {key.replace(/_/g, ' ')}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value == null ? 'None' : String(value)}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
