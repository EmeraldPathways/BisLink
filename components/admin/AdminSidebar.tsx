import Link from 'next/link';
import { Activity, Bot, Building2, CircleDollarSign, LayoutDashboard, MessageSquareWarning, Settings2, ShieldCheck } from 'lucide-react';
import { ADMIN_EMAIL } from '@/lib/admin-config';
import { SignOutButton } from '@/components/auth/SignOutButton';

const adminNav = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Businesses', href: '/admin/businesses', icon: Building2 },
  { label: 'Support', href: '/admin/support', icon: MessageSquareWarning },
  { label: 'Finance', href: '/admin/finance', icon: CircleDollarSign },
  { label: 'Agents', href: '/admin/agents', icon: Bot },
  { label: 'Settings', href: '/admin/settings', icon: Settings2 }
];

export function AdminSidebar({ adminEmail = ADMIN_EMAIL }: { adminEmail?: string }) {
  return (
    <aside className="hidden w-64 flex-col justify-between border-r border-[var(--color-border)] bg-white p-5 md:flex">
      <div>
        <div className="rounded-[24px] bg-[var(--color-void)] px-4 py-5 text-[var(--color-text-hero)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-gold)]">BisLink Admin</p>
          <h2 className="mt-2 font-display text-4xl">Control Room</h2>
          <p className="mt-2 text-sm text-[var(--color-text-hero-2)]">Separate from the owner dashboard. Internal only.</p>
        </div>

        <nav className="mt-8 space-y-1">
          {adminNav.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-[var(--color-surface-2)]">
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-[var(--color-gold-dark)]" />
            Verified admin
          </div>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{adminEmail}</p>
        </div>
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-3 text-sm font-medium">
          <Activity className="h-4 w-4" />
          Owner dashboard
        </Link>
        <SignOutButton
          redirectTo="/admin/login"
          className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </aside>
  );
}
