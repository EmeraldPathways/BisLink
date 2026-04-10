import { BookingPage } from '@/components/booking/BookingPage';
import { demoBusiness, demoServices } from '@/lib/demo-data';

export default function Page() {
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-5xl">My Link</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Customize the public page and keep the shareable link ready.</p>
        </div>
        <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
          <div className="space-y-3">
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.name} />
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.category} />
            <textarea className="min-h-[120px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.bio} />
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.location ?? ''} />
            <input className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" defaultValue={demoBusiness.slug} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white">Copy Link</button>
            <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold">Open Link</button>
          </div>
          <div className="mt-4 rounded-[22px] bg-[var(--color-surface-2)] p-4 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">QR code</p>
            <div className="mx-auto mt-3 grid h-40 w-40 grid-cols-6 gap-1">
              {Array.from({ length: 36 }).map((_, index) => (
                <div key={index} className={`${[0, 1, 4, 6, 8, 9, 13, 14, 17, 18, 20, 24, 29, 30, 31, 35].includes(index) ? 'bg-[var(--color-void)]' : 'bg-white'} rounded-sm`} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-white">
        <BookingPage business={demoBusiness} services={demoServices} />
      </div>
    </div>
  );
}
