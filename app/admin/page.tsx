import { formatPrice } from '@/lib/utils/formatting';
import { AdminMetricGrid } from '@/components/admin/AdminMetricGrid';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { adminHealth, adminOverview } from '@/lib/admin-data';

export default function AdminOverviewPage() {
  const metrics = [
    { label: 'Businesses', value: String(adminOverview.businesses) },
    { label: 'Customers', value: String(adminOverview.totalCustomers) },
    { label: 'Monthly revenue', value: formatPrice(adminOverview.monthlyRevenue) },
    { label: 'Upcoming payouts', value: String(adminOverview.upcomingPayouts) }
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
              ['App name', adminOverview.appName],
              ['Environment', adminOverview.environment],
              ['Primary admin', adminOverview.primaryAdmin],
              ['Active services', String(adminOverview.activeServices)],
              ['Active products', String(adminOverview.activeProducts)],
              ['Unverified reviews', String(adminOverview.openReviews)]
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
            {adminHealth.map((item) => (
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
    </div>
  );
}
