import Link from 'next/link';
import { AdminActionButton } from '@/components/admin/AdminActionButton';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { requireAdminUser } from '@/lib/admin';
import { getAdminSupportData } from '@/lib/admin-console-data';

export default async function AdminSupportPage() {
  await requireAdminUser();
  const { reviews, onboardingRisks, refundedOrders, bookingIssues } = await getAdminSupportData();

  return (
    <div className="space-y-6">
      <AdminTopbar title="Support + moderation" description="Moderate reviews, surface businesses with incomplete setup, and inspect recent payment and booking issues." />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
          <h2 className="font-display text-4xl">Recent reviews</h2>
          <div className="mt-5 space-y-3">
            {reviews.map((review: any) => (
              <div key={review.id} className="rounded-[20px] border border-[var(--color-border)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{review.customer_name}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{review.rating}/5 • {review.text || 'No written feedback'}</p>
                  </div>
                  <AdminActionButton
                    label={review.is_published ? 'Hide' : 'Publish'}
                    endpoint={`/api/admin/reviews/${review.id}`}
                    method="PATCH"
                    body={{ is_published: !review.is_published }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
          <h2 className="font-display text-4xl">Onboarding risk</h2>
          <div className="mt-5 space-y-3">
            {onboardingRisks.map((item) => (
              <Link key={item.business.id} href={`/admin/businesses/${item.business.id}`} className="block rounded-[20px] border border-[var(--color-border)] p-4">
                <p className="text-sm font-semibold">{item.business.name}</p>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{item.missing.join(' • ')}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ListSection
          title="Refunded orders"
          items={refundedOrders.map((order: any) => `${order.customer_name} • ${order.status} • ${new Date(order.created_at).toLocaleString()}`)}
          empty="No refunded orders."
        />
        <ListSection
          title="Booking issues"
          items={bookingIssues.map((booking: any) => `${booking.customer_name} • ${booking.status}/${booking.payment_status} • ${new Date(booking.start_time).toLocaleString()}`)}
          empty="No recent booking issues."
        />
      </div>
    </div>
  );
}

function ListSection({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
      <h2 className="font-display text-4xl">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.length ? items.map((item) => <div key={item} className="rounded-[20px] bg-[var(--color-surface-2)] p-4 text-sm">{item}</div>) : <div className="rounded-[20px] bg-[var(--color-surface-2)] p-4 text-sm text-[var(--color-text-secondary)]">{empty}</div>}
      </div>
    </section>
  );
}
