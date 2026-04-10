import Link from 'next/link';
import { CalendarDays, Clock3, DollarSign, Link2, Settings, Sparkles, Users } from 'lucide-react';
import type { BusinessProfile } from '@/types';

const items = [
  { label: 'Today', href: '/dashboard', icon: Clock3 },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Services', href: '/services', icon: Sparkles },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'My Link', href: '/link', icon: Link2 },
  { label: 'Payouts', href: '/payouts', icon: DollarSign }
];

export function Sidebar({ business }: { business: BusinessProfile }) {
  return (
    <aside className="hidden w-60 flex-col justify-between border-r border-[var(--color-border)] bg-white p-5 md:flex">
      <div>
        <p className="font-display text-3xl">YBIAL</p>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{business.name}</p>
        <nav className="mt-8 space-y-1">
          {items.map(({ label, href, icon: Icon }) => (
            <Link key={label} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-[var(--color-surface-2)]" href={href}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-3">
        <button className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-3 text-sm font-medium">
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <Link href={`/${business.slug}`} className="block rounded-2xl bg-[var(--color-void)] px-4 py-3 text-center text-sm font-semibold text-white">
          View My Link
        </Link>
        <div className="rounded-2xl bg-[var(--color-surface-2)] p-4">
          <p className="text-sm font-semibold">Studio Owner</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">owner@studioeleven.com</p>
        </div>
      </div>
    </aside>
  );
}
