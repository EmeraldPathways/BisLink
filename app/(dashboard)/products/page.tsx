import { ProductForm } from '@/components/dashboard/ProductForm';
import { ProductLimitBar } from '@/components/dashboard/ProductLimitBar';
import { getProductsData } from '@/lib/dashboard-data';
import { formatPrice } from '@/lib/utils/formatting';

export default async function Page() {
  const { products, activeProductCount } = await getProductsData();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-5xl">Products</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Manage up to 10 physical or digital products on your public link.</p>
        </div>
        <ProductLimitBar count={activeProductCount} />
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <div key={product.id} className="rounded-[24px] border border-[var(--color-border)] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {product.emoji} {product.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{product.category}</p>
                </div>
                <span className="rounded-full bg-[var(--color-surface-2)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                  {product.in_stock ? 'In stock' : 'Sold out'}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
                <div className="flex gap-2">
                  <button disabled className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-[13px] font-medium opacity-60">Edit</button>
                  <button disabled className="rounded-xl bg-[var(--color-void)] px-3 py-2 text-[13px] font-medium text-white opacity-60">Toggle</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ProductForm product={products[0]} />
    </div>
  );
}
