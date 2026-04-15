import { productEmojiChoices } from '@/lib/product-options';
import type { ProductRecord } from '@/types';

export function ProductForm({ product }: { product?: ProductRecord }) {
  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <h2 className="font-display text-4xl">{product ? 'Edit product' : 'Add product'}</h2>
      <div className="mt-5 grid gap-3">
        <div className="grid grid-cols-5 gap-2">
          {productEmojiChoices.map((emoji) => (
            <button key={emoji} disabled className="rounded-xl border border-[var(--color-border)] px-3 py-3 text-xl opacity-60">
              {emoji}
            </button>
          ))}
        </div>
        <input disabled defaultValue={product?.name} className="rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" placeholder="Product name" />
        <textarea disabled defaultValue={product?.description} className="min-h-[100px] rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" placeholder="Description" />
        <input disabled defaultValue={product?.category ?? ''} className="rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" placeholder="Category" />
        <div className="grid grid-cols-2 gap-3">
          <input disabled defaultValue={product ? product.price / 100 : ''} className="rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" placeholder="Price" />
          <input disabled defaultValue={product?.original_price ? product.original_price / 100 : ''} className="rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" placeholder="Original price" />
        </div>
        <select disabled defaultValue={product?.badge ?? ''} className="rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60">
          <option value="">No badge</option>
          <option value="Best Seller">Best Seller</option>
          <option value="New">New</option>
          <option value="Limited">Limited</option>
        </select>
        <button disabled className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white opacity-60">
          {product ? 'Save product' : 'Create product'}
        </button>
        <p className="text-xs text-[var(--color-text-secondary)]">Product editing is scheduled for Phase 2.</p>
      </div>
    </div>
  );
}
