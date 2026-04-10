import Link from 'next/link';
import { CalendarDays, Clock3, DollarSign, Link2, Sparkles, Users } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { demoBusiness } from '@/lib/demo-data';

const mobileNav = [
  { label: 'Today', href: '/dashboard', icon: Clock3 },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Services', href: '/services', icon: Sparkles },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Payouts', href: '/payouts', icon: DollarSign },
  { label: 'My Link', href: '/link', icon: Link2 }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] md:flex">
      <Sidebar business={demoBusiness} />
      <main className="flex-1 px-5 pb-24 pt-6 md:px-8 md:pb-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-white px-3 py-2 md:hidden">
        <div className="grid grid-cols-6 gap-1">
          {mobileNav.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] text-[var(--color-text-secondary)]">
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
