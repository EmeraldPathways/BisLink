import { CustomerRow } from '@/components/dashboard/CustomerRow';
import { demoCustomers } from '@/lib/demo-data';

export default function Page() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-5xl">Customers</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Search, sort, and review booking history for repeat clients.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3" placeholder="Search by name or email" />
          <input className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3" type="date" />
          <select className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3">
            <option>Most recent</option>
            <option>Most bookings</option>
            <option>Highest spend</option>
          </select>
        </div>
      </div>
      <div className="space-y-3 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
        {demoCustomers.map((customer) => (
          <CustomerRow key={customer.id} customer={customer} />
        ))}
      </div>
    </div>
  );
}
