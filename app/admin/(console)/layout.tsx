import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] md:flex">
      <AdminSidebar />
      <main className="flex-1 px-5 pb-24 pt-6 md:px-8 md:pb-8">{children}</main>
    </div>
  );
}
