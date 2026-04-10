import { formatDateLabel, formatPrice } from '@/lib/utils/formatting';
import { BookingCard } from './BookingCard';
import { StatsBar } from './StatsBar';
import { demoServices } from '@/lib/demo-data';
import type { BookingRecord, BusinessProfile, DashboardStats } from '@/types';

export function TodayView({
  business,
  bookings,
  stats
}: {
  business: BusinessProfile;
  bookings: BookingRecord[];
  stats: DashboardStats;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-5xl tracking-[-0.6px]">Good morning, Studio</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {formatDateLabel(new Date(), business.timezone, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="rounded-[22px] bg-[var(--color-void)] px-6 py-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)]">Revenue today</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-gold)]">{formatPrice(stats.todayRevenue)}</p>
        </div>
      </div>

      <StatsBar stats={stats} />

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-4xl">Upcoming bookings</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Real-time updates appear here when new bookings land.</p>
        </div>
        {bookings.length ? (
          bookings.map((booking) => {
            const service = demoServices.find((item) => item.id === booking.service_id)!;
            return <BookingCard key={booking.id} booking={booking} business={business} service={service} />;
          })
        ) : (
          <div className="rounded-[28px] border border-dashed border-[var(--color-border)] bg-white p-12 text-center">
            <h3 className="font-display text-4xl">No bookings today</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Share your link to start filling the calendar.</p>
            <button className="mt-5 rounded-2xl bg-[var(--color-void)] px-5 py-3 text-sm font-semibold text-white">Share your link</button>
          </div>
        )}
      </section>
    </div>
  );
}
