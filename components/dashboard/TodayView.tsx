import { CalendarDays, Share2 } from 'lucide-react';
import { ActivationNudgeCard } from '@/components/support/ActivationNudgeCard';
import type { ActivationStatus } from '@/lib/agents/types';
import { formatDateLabel, formatPrice } from '@/lib/utils/formatting';
import { BookingCard } from './BookingCard';
import { RecentOrdersPanel } from './RecentOrdersPanel';
import { StatsBar } from './StatsBar';
import type { BusinessProfile, DashboardBookingRecord, DashboardStats } from '@/types';

export function TodayView({
  activationStatus,
  business,
  bookings,
  recentOrders,
  stats
}: {
  activationStatus: ActivationStatus;
  business: BusinessProfile;
  bookings: DashboardBookingRecord[];
  recentOrders: Array<{
    id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    status: string;
    created_at: string | null;
    confirmation_sent?: boolean | null;
  }>;
  stats: DashboardStats;
}) {
  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-[-0.4px] md:text-5xl md:tracking-[-0.6px]">
            Good morning, Studio
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <CalendarDays className="h-4 w-4 opacity-60" />
            {formatDateLabel(new Date(), business.timezone, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Revenue Card */}
        <div className="shrink-0 rounded-[22px] px-5 py-4 text-white md:px-6 md:py-5" style={{ background: 'var(--revenue-gradient)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)] md:text-[11px]">
            Revenue today
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-gold)] md:text-3xl">
            {formatPrice(stats.todayRevenue)}
          </p>
        </div>
      </div>

      <StatsBar stats={stats} />

      <ActivationNudgeCard activationStatus={activationStatus} />

      {/* Upcoming Bookings */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-3xl md:text-4xl">Upcoming bookings</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Real-time updates appear here when new bookings land.
          </p>
        </div>
        {bookings.length ? (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                business={business}
                service={booking.service}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-[28px] bg-[var(--color-surface-2)] p-8 text-center md:p-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-3)] md:h-16 md:w-16">
              <CalendarDays className="h-6 w-6 text-[var(--empty-state-icon)] md:h-8 md:w-8" />
            </div>
            <h3 className="mt-4 font-display text-2xl md:text-4xl">No bookings today</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Share your link to start filling the calendar.
            </p>
            <button className="btn-primary mt-5 w-full md:w-auto">
              <Share2 className="h-4 w-4" />
              Share your link
            </button>
          </div>
        )}
      </section>

      <RecentOrdersPanel business={business} recentOrders={recentOrders} />
    </div>
  );
}
