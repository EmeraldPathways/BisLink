import { demoProducts } from '@/lib/demo-data';
import { formatPrice } from '@/lib/utils/formatting';

export function Step4Products() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 4 of 7</p>
        <h2 className="mt-2 font-display text-5xl">Your products</h2>
      </div>
      <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
        Add up to 10 products to sell from the same link. Skip this step if you only want bookings right now.
      </p>
      <div className="rounded-[22px] border border-[var(--color-border)] bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Product slots used</p>
          <p className="text-sm font-semibold text-[var(--color-gold-dark)]">{demoProducts.length} / 10</p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[var(--color-surface-3)]">
          <div className="h-full rounded-full bg-[var(--color-void)]" style={{ width: `${(demoProducts.length / 10) * 100}%` }} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {demoProducts.map((product) => (
          <div key={product.id} className="rounded-[22px] border border-[var(--color-border)] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl">{product.emoji}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">{product.name}</p>
              </div>
              {product.badge ? (
                <span className="rounded-full bg-[var(--color-surface-2)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-gold-dark)]">
                  {product.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{product.description}</p>
            <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">{formatPrice(product.price)}</p>
          </div>
        ))}
      </div>
      <button className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text-secondary)]">I&apos;ll add products later</button>
    </div>
  );
}
