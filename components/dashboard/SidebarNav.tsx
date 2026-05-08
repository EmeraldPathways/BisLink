'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  DollarSign,
  Link2,
  LifeBuoy,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import type { BusinessProfile } from '@/types';

const navItems = [
  { label: 'Today', href: '/dashboard', icon: Clock3 },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Services', href: '/services', icon: Sparkles },
  { label: 'Products', href: '/products', icon: ShoppingBag },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Support', href: '/support', icon: LifeBuoy },
  { label: 'Reviews', href: '/reviews', icon: Star },
  { label: 'My Link', href: '/link', icon: Link2, match: 'exact' as const },
  { label: 'Theme', href: '/link/theme', icon: Settings, match: 'exact' as const },
  { label: 'Payouts', href: '/payouts', icon: DollarSign },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function SidebarNav({
  business,
  userEmail,
}: {
  business: BusinessProfile;
  userEmail: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-col justify-between border-r border-[var(--color-border)] bg-white p-5 md:flex">
      <div>
        <p className="font-display text-3xl tracking-tight">YBIAL</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{business.name}</p>
      </div>

      <div className="space-y-4">
        <nav className="space-y-1">
          {navItems.map(({ label, href, icon: Icon, match }) => {
            const isActive =
              match === 'exact'
                ? pathname === href
                : pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={label}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'sidebar-link-active'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-70" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
          <Link
            href="/availability"
            className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-2)]"
          >
            <Settings className="h-4 w-4 shrink-0 opacity-70" />
            Availability
          </Link>

          <SignOutButton
            redirectTo="/login"
            className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-60"
          />

          <Link
            href={`/${business.slug}`}
            className="btn-primary w-full text-sm"
          >
            View My Link
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface-2)] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-void)] text-xs font-semibold text-[var(--color-gold)]">
              {getInitials(business.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Studio Owner</p>
              <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] truncate">
                {userEmail ?? business.email ?? 'Owner account'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
