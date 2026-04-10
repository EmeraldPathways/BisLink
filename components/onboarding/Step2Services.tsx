import { demoServices } from '@/lib/demo-data';
import { formatPrice } from '@/lib/utils/formatting';

export function Step2Services() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 2 of 5</p>
        <h2 className="mt-2 font-display text-5xl">Your services</h2>
      </div>
      {demoServices.slice(0, 3).map((service) => (
        <div key={service.id} className="rounded-[22px] border border-[var(--color-border)] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                {service.emoji} {service.name}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{service.description}</p>
            </div>
            <p className="text-sm font-semibold">{formatPrice(service.price)}</p>
          </div>
        </div>
      ))}
      <button className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4 text-sm font-semibold">Add another service</button>
    </div>
  );
}
