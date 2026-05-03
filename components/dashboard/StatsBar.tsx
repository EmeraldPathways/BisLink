import { Calendar, CalendarDays, TrendingUp, Users } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatting';
import type { DashboardStats } from '@/types';

const statConfig = [
  {
    label: 'Today',
    getValue: (s: DashboardStats) => `${s.todayBookings} bookings`,
    icon: Calendar,
    iconColor: 'text-[var(--color-void)]',
    iconBg: 'bg-[var(--color-surface-2)]',
  },
  {
    label: 'This Week',
    getValue: (s: DashboardStats) => `${s.weekBookings} bookings · ${formatPrice(s.weekRevenue)}`,
    icon: CalendarDays,
    iconColor: 'text-[var(--color-gold-dark)]',
    iconBg: 'bg-[var(--color-gold-muted)]',
  },
  {
    label: 'This Month',
    getValue: (s: DashboardStats) => formatPrice(s.monthRevenue),
    icon: TrendingUp,
    iconColor: 'text-[var(--stat-positive-color)]',
    iconBg: 'bg-[var(--stat-positive-bg)]',
  },
  {
    label: 'Customers',
    getValue: (s: DashboardStats) => `${s.customers} active`,
    icon: Users,
    iconColor: 'text-[var(--stat-info-color)]',
    iconBg: 'bg-[var(--stat-info-bg)]',
  },
];

export function StatsBar({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
      {statConfig.map(({ label, getValue, icon: Icon, iconColor, iconBg }) => (
        <div key={label} className="stat-card">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full md:h-9 md:w-9 ${iconBg}`}
            >
              <Icon className={`h-4 w-4 md:h-[18px] md:w-[18px] ${iconColor}`} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] md:text-[11px]">
              {label}
            </p>
          </div>
          <p className="mt-3 text-base font-semibold text-[var(--color-text-primary)] md:text-lg">
            {getValue(stats)}
          </p>
        </div>
      ))}
    </div>
  );
}
