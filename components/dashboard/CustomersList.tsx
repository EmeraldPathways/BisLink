'use client';

import { useMemo, useState } from 'react';
import { CustomerRow } from '@/components/dashboard/CustomerRow';
import type { CustomerRecord } from '@/types';

type SortKey = 'recent' | 'bookings' | 'spend';

export function CustomersList({ customers, timezone }: { customers: CustomerRecord[]; timezone: string }) {
  const [query, setQuery] = useState('');
  const [activeAfter, setActiveAfter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recent');

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const activeAfterTime = activeAfter ? new Date(`${activeAfter}T00:00:00`).getTime() : null;

    return [...customers]
      .filter((customer) => {
        if (normalizedQuery) {
          const haystack = [customer.name, customer.email, customer.phone ?? ''].join(' ').toLowerCase();
          if (!haystack.includes(normalizedQuery)) {
            return false;
          }
        }

        if (activeAfterTime) {
          const candidate = customer.last_activity_at ?? customer.last_booking_at ?? customer.first_activity_at ?? null;
          if (!candidate || Number.isNaN(new Date(candidate).getTime()) || new Date(candidate).getTime() < activeAfterTime) {
            return false;
          }
        }

        return true;
      })
      .sort((left, right) => {
        if (sortKey === 'bookings') {
          return (right.total_bookings ?? 0) - (left.total_bookings ?? 0);
        }

        if (sortKey === 'spend') {
          return (right.total_spent ?? 0) - (left.total_spent ?? 0);
        }

        const leftDate = new Date(left.last_activity_at ?? left.last_booking_at ?? left.first_activity_at ?? 0).getTime();
        const rightDate = new Date(right.last_activity_at ?? right.last_booking_at ?? right.first_activity_at ?? 0).getTime();
        return rightDate - leftDate;
      });
  }, [activeAfter, customers, query, sortKey]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-5xl">Customers</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Search, sort, and review booking history for repeat clients.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3"
            placeholder="Search by name or email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <input
            className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3"
            type="date"
            value={activeAfter}
            onChange={(event) => setActiveAfter(event.target.value)}
          />
          <select className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3" value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            <option value="recent">Most recent</option>
            <option value="bookings">Most bookings</option>
            <option value="spend">Highest spend</option>
          </select>
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
        {filteredCustomers.length ? (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <CustomerRow key={customer.id} customer={customer} timezone={timezone} />
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] bg-white px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">
            No customers matched the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
