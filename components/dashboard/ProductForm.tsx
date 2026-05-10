'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ImageUploadField } from '@/components/dashboard/ImageUploadField';
import { getDefaultProductEmoji } from '@/lib/product-emoji';
import type { ProductRecord } from '@/types';

type ProductFormState = {
  name: string;
  description: string;
  category: string;
  price: string;
  original_price: string;
  badge: string;
  image_url: string;
};

export function ProductForm({ product }: { product?: ProductRecord }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(() => buildFormState(product));

  useEffect(() => {
    setForm(buildFormState(product));
    setError(null);
    setMessage(null);
  }, [product]);

  function updateField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    setError(null);
    setMessage(null);

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: Math.round(Number(form.price || '0') * 100),
      original_price: form.original_price ? Math.round(Number(form.original_price) * 100) : undefined,
      badge: form.badge,
      image_url: form.image_url
    };

    const res = await fetch(product ? `/api/owner/products/${product.id}` : '/api/owner/products', {
      method: product ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = (await res.json().catch(() => null)) as { error?: string; product?: { id: string } } | null;
    if (!res.ok) {
      setError(data?.error ?? 'Failed to save product');
      return;
    }

    setMessage(product ? 'Product updated' : 'Product created');
    startTransition(() => {
      router.push(data?.product?.id ? `${pathname}?edit=${data.product.id}` : pathname);
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-full rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-4xl">{product ? 'Edit product' : 'Add product'}</h2>
        {product ? (
          <button
            onClick={() => router.push(pathname)}
            className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-medium"
            type="button"
          >
            New
          </button>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3">
        <input value={form.name} onChange={(event) => updateField('name', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Product name" />
        <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} className="min-h-[100px] w-full rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Description" />
        <ImageUploadField
          label="Product image"
          description="Shown on the public shop cards and product detail view."
          value={form.image_url}
          kind="product"
          aspectHint="Square image recommended."
          onChange={(url) => updateField('image_url', url)}
        />
        <input value={form.category} onChange={(event) => updateField('category', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Category" />
        <div className="grid grid-cols-2 gap-3">
          <input value={form.price} onChange={(event) => updateField('price', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Price" type="number" min="0" step="0.01" />
          <input value={form.original_price} onChange={(event) => updateField('original_price', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Original price" type="number" min="0" step="0.01" />
        </div>
        <select value={form.badge} onChange={(event) => updateField('badge', event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3">
          <option value="">No badge</option>
          <option value="Best Seller">Best Seller</option>
          <option value="New">New</option>
          <option value="Limited">Limited</option>
        </select>
        <button onClick={submit} disabled={isPending} className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {product ? 'Save product' : 'Create product'}
        </button>
        {message ? <p className="text-xs text-green-700">{message}</p> : null}
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

function buildFormState(product?: ProductRecord): ProductFormState {
  return {
    name: product?.name ?? '',
    description: product?.description ?? '',
    category: product?.category ?? '',
    price: product ? String(product.price / 100) : '',
    original_price: product?.original_price ? String(product.original_price / 100) : '',
    badge: product?.badge ?? '',
    image_url: product?.image_url ?? ''
  };
}
