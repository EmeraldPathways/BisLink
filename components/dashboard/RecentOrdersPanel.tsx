import type { BusinessProfile } from '@/types';
import { formatDateTimeLabel, formatPrice } from '@/lib/utils/formatting';

type RecentOrder = {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string | null;
  confirmation_sent?: boolean | null;
};

export function RecentOrdersPanel({
  business,
  recentOrders,
}: {
  business: BusinessProfile;
  recentOrders: RecentOrder[];
}) {
  return (
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
                  <p className="text-sm font-semibold">{order.customer_name}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {order.customer_email}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {order.created_at
                      ? formatDateTimeLabel(order.created_at, business.timezone)
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
  );
}
