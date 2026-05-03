import { MobileNav } from '@/components/dashboard/MobileNav';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { getDashboardShellData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { business, user } = await getDashboardShellData();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] md:flex">
      <SidebarNav
        business={business}
        userEmail={user.email ?? business.email ?? null}
      />
      <main className="flex-1 overflow-x-hidden px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-5 md:px-8 md:pb-8 md:pt-6">
        {children}
      </main>
      <MobileNav
        business={business}
        userEmail={user.email ?? business.email ?? null}
      />
    </div>
  );
}
