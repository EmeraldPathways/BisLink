import { CustomerRow } from '@/components/dashboard/CustomerRow';
import { getCustomersData } from '@/lib/dashboard-data';

export default async function Page() {
  const { business, customers } = await getCustomersData();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-5xl">Customers</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Search, sort, and review booking history for repeat clients.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input disabled className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 opacity-60" placeholder="Search by name or email" />
          <input disabled className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 opacity-60" type="date" />
          <select disabled className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 opacity-60">
            <option>Most recent</option>
            <option>Most bookings</option>
            <option>Highest spend</option>
          </select>
        </div>
      </div>
      <div className="space-y-3 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
        {customers.map((customer) => (
          <CustomerRow key={customer.id} customer={customer} timezone={business.timezone} />
        ))}
      </div>
    </div>
  );
}
