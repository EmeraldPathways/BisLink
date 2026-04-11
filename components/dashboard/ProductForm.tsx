import { productEmojiChoices } from '@/lib/demo-data';
import type { ProductRecord } from '@/types';

export function ProductForm({ product }: { product?: ProductRecord }) {
  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <h2 className="font-display text-4xl">{product ? 'Edit product' : 'Add product'}</h2>
      <div className="mt-5 grid gap-3">
        <div className="grid grid-cols-5 gap-2">
          {productEmojiChoices.map((emoji) => (
            <button key={emoji} className="rounded-xl border border-[var(--color-border)] px-3 py-3 text-xl">
              {emoji}
            </button>
          ))}
        </div>
        <input defaultValue={product?.name} className="rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Product name" />
        <textarea defaultValue={product?.description} className="min-h-[100px] rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Description" />
        <input defaultValue={product?.category ?? ''} className="rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Category" />
        <div className="grid grid-cols-2 gap-3">
          <input defaultValue={product ? product.price / 100 : ''} className="rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Price" />
          <input defaultValue={product?.original_price ? product.original_price / 100 : ''} className="rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Original price" />
        </div>
        <select defaultValue={product?.badge ?? ''} className="rounded-xl border border-[var(--color-border)] px-4 py-3">
          <option value="">No badge</option>
          <option value="Best Seller">Best Seller</option>
          <option value="New">New</option>
          <option value="Limited">Limited</option>
        </select>
        <button className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white">
          {product ? 'Save product' : 'Create product'}
        </button>
      </div>
    </div>
  );
}
