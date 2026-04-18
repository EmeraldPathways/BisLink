import Link from 'next/link';
import { CalendarDays, Clock3, DollarSign, Link2, Settings, ShoppingBag, Sparkles, Star, Users } from 'lucide-react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { getDashboardShellData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

const navItems = [
  { label: 'Today', href: '/dashboard', icon: Clock3 },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Services', href: '/services', icon: Sparkles },
  { label: 'Products', href: '/products', icon: ShoppingBag },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Reviews', href: '/reviews', icon: Star },
  { label: 'My Link', href: '/link', icon: Link2 },
  { label: 'Payouts', href: '/payouts', icon: DollarSign }
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { business, user } = await getDashboardShellData();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] md:flex">
      <aside className="hidden w-60 flex-col justify-between border-r border-[var(--color-border)] bg-white p-5 md:flex">
        <div>
          <p className="font-display text-3xl">YBIAL</p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{business.name}</p>
          <nav className="mt-8 space-y-1">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link key={label} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-[var(--color-surface-2)]" href={href}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="space-y-3">
          <Link href="/availability" className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-3 text-sm font-medium">
            <Settings className="h-4 w-4" />
            Availability
          </Link>
          <SignOutButton
            redirectTo="/login"
            className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Link href={`/${business.slug}`} className="block rounded-2xl bg-[var(--color-void)] px-4 py-3 text-center text-sm font-semibold text-white">
            View My Link -&gt;
          </Link>
          <div className="rounded-2xl bg-[var(--color-surface-2)] p-4">
            <p className="text-sm font-semibold">Studio Owner</p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{user.email ?? business.email ?? 'Owner account'}</p>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden px-5 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-6 md:px-8 md:pb-8">{children}</main>
      <MobileNav business={business} userEmail={user.email ?? business.email ?? null} />
    </div>
  );
}
