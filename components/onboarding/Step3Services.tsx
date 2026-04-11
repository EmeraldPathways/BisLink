import { demoServices } from '@/lib/demo-data';
import { formatPrice } from '@/lib/utils/formatting';

export function Step3Services() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 3 of 7</p>
        <h2 className="mt-2 font-display text-5xl">Your services</h2>
      </div>
      <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
        Start with your core offers. Customers only need a clear name, a time, and a price to book.
      </p>
      <div className="space-y-3">
        {demoServices.map((service) => (
          <div key={service.id} className="rounded-[22px] border border-[var(--color-border)] bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  <span className="mr-2">{service.emoji}</span>
                  {service.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{service.description}</p>
              </div>
              {service.tag ? (
                <span className="rounded-full bg-[var(--color-gold-muted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-gold-dark)]">
                  {service.tag}
                </span>
              ) : null}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
              <span>{service.duration_minutes} min</span>
              <span className="font-semibold text-[var(--color-text-primary)]">{formatPrice(service.price)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
