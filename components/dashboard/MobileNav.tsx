'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  Clock3,
  DollarSign,
  LifeBuoy,
  Link2,
  MoreHorizontal,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  X
} from 'lucide-react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import type { BusinessProfile } from '@/types';

const primaryItems = [
  { label: 'Today', href: '/dashboard', icon: Clock3 },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Services', href: '/services', icon: Sparkles },
  { label: 'Products', href: '/products', icon: ShoppingBag }
];

const moreItems = [
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Support', href: '/support', icon: LifeBuoy },
  { label: 'Reviews', href: '/reviews', icon: Star },
  { label: 'My Link', href: '/link', icon: Link2, match: 'exact' as const },
  { label: 'Theme', href: '/link/theme', icon: Settings, match: 'exact' as const },
  { label: 'Payouts', href: '/payouts', icon: DollarSign },
  { label: 'Availability', href: '/availability', icon: Settings }
];

export function MobileNav({
  business,
  userEmail
}: {
  business: BusinessProfile;
  userEmail: string | null;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 md:hidden"
      >
        <div className="grid grid-cols-5 gap-1">
          {primaryItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={label}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] transition-all duration-150 ${
                  isActive
                    ? 'mobile-nav-active'
                    : 'text-[var(--color-text-secondary)]'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open more navigation options"
            aria-expanded={isOpen}
            className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            More
          </button>
        </div>
      </nav>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close more navigation"
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="More navigation options"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] border-t border-[var(--color-border)] bg-white pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 transition-transform duration-300 md:hidden"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)]" />
            <div className="flex items-center justify-between px-5 pb-3">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">More</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close more navigation"
                className="rounded-xl p-2 hover:bg-[var(--color-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-void)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Additional navigation">
              {moreItems.map(({ label, href, icon: Icon, match }) => {
                const isActive =
                  match === 'exact'
                    ? pathname === href
                    : pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                return (
                  <Link
                    key={label}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-4 px-5 py-4 text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-void)] ${
                      isActive
                        ? 'font-semibold text-[var(--color-void)]'
                        : 'text-[var(--color-text-primary)]'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-[var(--color-text-secondary)]" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mx-5 mt-4 rounded-2xl bg-[var(--color-surface-2)] p-4">
              <p className="text-sm font-semibold">{business.name}</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{userEmail ?? business.email ?? 'Owner account'}</p>
              <SignOutButton
                redirectTo="/login"
                className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <Link href={`/${business.slug}`} className="mt-3 block rounded-2xl bg-[var(--color-void)] px-4 py-3 text-center text-sm font-semibold text-white">
                View My Link -&gt;
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
