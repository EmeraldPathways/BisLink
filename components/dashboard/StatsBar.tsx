import { formatPrice } from '@/lib/utils/formatting';
import type { DashboardStats } from '@/types';

export function StatsBar({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {[
        ['Today', `${stats.todayBookings} bookings`],
        ['This Week', `${stats.weekBookings} bookings · ${formatPrice(stats.weekRevenue)}`],
        ['This Month', formatPrice(stats.monthRevenue)],
        ['Customers', `${stats.customers} active`]
      ].map(([label, value]) => (
        <div key={label} className="rounded-[22px] border border-[var(--color-border)] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">{label}</p>
          <p className="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">{value}</p>
        </div>
      ))}
    </div>
  );
}
