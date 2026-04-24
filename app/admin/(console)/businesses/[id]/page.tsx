import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminActionButton } from '@/components/admin/AdminActionButton';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { requireAdminUser } from '@/lib/admin';
import { getAdminBusinessDetailData } from '@/lib/admin-console-data';
import { formatPrice } from '@/lib/utils/formatting';

export const dynamic = 'force-dynamic';

export default async function AdminBusinessDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdminUser();
  const data = await getAdminBusinessDetailData(params.id);
  if (!data) notFound();

  const { business, counts, onboarding, bookings, orders, reviews, customers } =
    data;

  return (
    <div className="space-y-6">
      <AdminTopbar
        title={business.name}
        description={`Operational detail for /${business.slug}. Monitor onboarding, commerce, reviews, and intervention actions for this business.`}
      />

      <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">
              {business.category}
            </p>
            <h2 className="mt-2 font-display text-4xl">{business.name}</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {business.ownerEmail} • {business.location ?? 'No location set'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <AdminActionButton
              label={
                business.is_active ? 'Deactivate business' : 'Activate business'
              }
              endpoint={`/api/admin/businesses/${business.id}/status`}
              method="PATCH"
              body={{ is_active: !business.is_active }}
              tone={business.is_active ? 'danger' : 'default'}
            />
            <AdminActionButton
              label="Reopen Stripe onboarding"
              endpoint={`/api/admin/businesses/${business.id}/stripe-connect`}
            />
            <Link
              href={`/${business.slug}`}
              className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-medium"
            >
              Open public page
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <Metric label="Services" value={String(counts.services)} />
          <Metric label="Products" value={String(counts.products)} />
          <Metric label="Customers" value={String(counts.customers)} />
          <Metric label="Reviews" value={String(counts.reviews)} />
          <Metric
            label="Stripe"
            value={business.stripe_onboarded ? 'Connected' : 'Needs setup'}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
          <h2 className="font-display text-4xl">Onboarding completeness</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Object.entries(onboarding).map(([label, complete]) => (
              <div
                key={label}
                className="rounded-[20px] bg-[var(--color-surface-2)] p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {complete ? 'Complete' : 'Missing'}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
          <h2 className="font-display text-4xl">Profile + connections</h2>
          <div className="mt-5 space-y-3">
            {[
              ['Slug', `/${business.slug}`],
              ['Timezone', business.timezone ?? 'Unknown'],
              ['Currency', business.currency ?? 'usd'],
              ['Stripe account', business.stripe_account_id ?? 'Not created'],
              [
                'Google Calendar',
                business.google_cal_token ? 'Connected' : 'Not connected',
              ],
              [
                'Microsoft Calendar',
                business.microsoft_cal_token ? 'Connected' : 'Not connected',
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[20px] bg-[var(--color-surface-2)] p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CardList
          title="Recent bookings"
          items={bookings.map(
            (booking) =>
              `${booking.customer_name} • ${booking.status} • ${booking.start_time ? new Date(booking.start_time).toLocaleString() : 'Unknown time'}`,
          )}
        />
        <CardList
          title="Recent orders"
          items={orders.map(
            (order) =>
              `${order.customer_name} • ${order.status} • ${formatPrice(order.total_amount, business.currency ?? 'USD')}`,
          )}
        />
        <CardList
          title="Recent reviews"
          items={reviews.map(
            (review) =>
              `${review.customer_name} • ${review.is_published ? 'visible' : 'hidden'} • ${review.rating}/5`,
          )}
        />
        <CardList
          title="Customers"
          items={customers.map(
            (customer) =>
              `${customer.name} • ${(customer.total_bookings ?? 0) + (customer.total_orders ?? 0)} interactions • ${formatPrice(customer.total_spent ?? 0, business.currency ?? 'USD')}`,
          )}
        />
      </div>
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

function CardList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
      <h2 className="font-display text-4xl">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={item}
              className="rounded-[20px] bg-[var(--color-surface-2)] p-4 text-sm text-[var(--color-text-primary)]"
            >
              {item}
            </div>
          ))
        ) : (
          <div className="rounded-[20px] bg-[var(--color-surface-2)] p-4 text-sm text-[var(--color-text-secondary)]">
            No records yet.
          </div>
        )}
      </div>
    </section>
  );
}
