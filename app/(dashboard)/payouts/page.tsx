import { getPayoutsData } from '@/lib/dashboard-data';
import { formatDateTimeLabel, formatPrice } from '@/lib/utils/formatting';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const {
    business,
    calendarStatus,
    contactStatus,
    orderConfirmationStatus,
    payouts,
    recentOrders,
    revenue,
    totals,
  } = await getPayoutsData();
  const max = Math.max(...revenue.map((item) => item.amount), 1);
  const hasContactIssue = contactStatus !== 'Contact email configured';
  const hasPendingOrders =
    orderConfirmationStatus !== 'No pending confirmations';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl">Payouts</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Stripe Connect status, revenue totals, and payout history in one
          place.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatusCard
          label="Stripe"
          value={business.stripe_onboarded ? 'Connected' : 'Setup needed'}
          tone={business.stripe_onboarded ? 'good' : 'warn'}
        />
        <StatusCard
          label="Calendar"
          value={calendarStatus}
          tone={calendarStatus === 'Connected' ? 'good' : 'warn'}
        />
        <StatusCard
          label="Contact"
          value={contactStatus}
          tone={hasContactIssue ? 'warn' : 'good'}
        />
        <StatusCard
          label="Orders"
          value={orderConfirmationStatus}
          tone={hasPendingOrders ? 'warn' : 'good'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['This week', formatPrice(totals.week, business.currency)],
          ['This month', formatPrice(totals.month, business.currency)],
          ['All time', formatPrice(totals.allTime, business.currency)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[22px] border border-[var(--color-border)] bg-white p-5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
              {label}
            </p>
            <p className="mt-3 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-4xl">Last 7 days</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Daily revenue
              </p>
            </div>
            <span className="rounded-full bg-[var(--color-gold-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-gold-dark)]">
              {business.stripe_onboarded
                ? 'Stripe connected'
                : 'Stripe setup needed'}
            </span>
          </div>
          <div className="flex h-64 items-end gap-3">
            {revenue.map((point) => (
              <div
                key={point.label}
                className="flex flex-1 flex-col items-center gap-3"
              >
                <div
                  className="flex w-full items-end rounded-t-[18px] bg-[var(--color-surface-2)]"
                  style={{ height: `${(point.amount / max) * 100}%` }}
                >
                  <div className="w-full rounded-t-[18px] bg-[var(--color-void)] px-2 py-2 text-center text-[11px] font-semibold text-[var(--color-gold)]">
                    {point.amount
                      ? formatPrice(point.amount, business.currency)
                      : '—'}
                  </div>
                </div>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
          <h2 className="font-display text-4xl">Payout history</h2>
          <div className="mt-5 space-y-3">
            {payouts.length ? (
              payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="rounded-[18px] bg-[var(--color-surface-2)] px-4 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {formatPrice(payout.amount, business.currency)}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {formatDateTimeLabel(payout.date, business.timezone)}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                      {payout.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[18px] bg-[var(--color-surface-2)] px-4 py-4 text-sm text-[var(--color-text-secondary)]">
                {business.stripe_onboarded
                  ? 'No payouts found yet.'
                  : 'Complete Stripe onboarding to start receiving payouts.'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
        <div className="mb-5">
          <h2 className="font-display text-4xl">Recent orders</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Latest product payments and fulfillment context.
          </p>
        </div>
        <div className="space-y-3">
          {recentOrders.length ? (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-[18px] bg-[var(--color-surface-2)] px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {order.customer_name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {order.customer_email}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {order.created_at
                        ? formatDateTimeLabel(
                            order.created_at,
                            business.timezone,
                          )
                        : 'Pending timestamp'}
                    </p>
                    {order.status === 'paid' || order.status === 'fulfilled' ? (
                      <p className="mt-1 text-xs font-medium text-[var(--color-text-secondary)]">
                        {order.confirmation_sent
                          ? 'Confirmation sent'
                          : 'Confirmation pending'}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatPrice(order.total_amount, business.currency)}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[18px] bg-[var(--color-surface-2)] px-4 py-4 text-sm text-[var(--color-text-secondary)]">
              No product orders yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'good' | 'warn';
}) {
  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
        {label}
      </p>
      <p
        className={`mt-3 text-sm font-semibold ${
          tone === 'good' ? 'text-emerald-700' : 'text-amber-700'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
