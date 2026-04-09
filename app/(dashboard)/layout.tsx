import Link from 'next/link';

const nav = [
  ['Today', '/dashboard'],
  ['Calendar', '/calendar'],
  ['Services', '/services'],
  ['Availability', '/availability'],
  ['Customers', '/customers'],
  ['My Link', '/link'],
  ['Payouts', '/payouts']
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 border-r bg-white p-4 md:block">
        <p className="font-display text-3xl">YBIAL</p>
        <nav className="mt-6 space-y-2">{nav.map(([label, href]) => <Link key={label} className="block rounded-lg px-3 py-2 hover:bg-zinc-100" href={href}>{label}</Link>)}</nav>
      </aside>
      <main className="flex-1 bg-[var(--color-bg)] p-6">{children}</main>
    </div>
  );
}
