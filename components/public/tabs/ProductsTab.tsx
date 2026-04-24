'use client';

import { motion } from 'framer-motion';
import { Check, Package, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatting';
import type { ProductRecord } from '@/types';

export function ProductsTab({
  products,
  categories,
  activeCategory,
  onCategoryChange,
  onOpen,
  onAdd,
  inCart,
  getQuantity
}: {
  products: ProductRecord[];
  categories: string[];
  activeCategory: string;
  onCategoryChange: (value: string) => void;
  onOpen: (product: ProductRecord) => void;
  onAdd: (product: ProductRecord) => void;
  inCart: (productId: string) => boolean;
  getQuantity: (productId: string) => number;
}) {
  return (
    <section className="space-y-4 px-2 pb-24 pt-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => {
          const active = category === activeCategory;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${active ? 'border-[var(--void)] bg-[var(--void)] text-white' : 'border-[var(--border)] bg-white text-[var(--text-3)]'}`}
            >
              {category}
            </button>
          );
        })}
      </div>
      <div className="rounded-[18px] border-[1.5px] border-[var(--border)] bg-white p-3">
      <div className="grid grid-cols-2 gap-3">
        {products.map((product, index) => (
          (() => {
            const quantity = getQuantity(product.id);
            const reachedCartLimit = quantity >= 10;
            return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * index }}
            className={`overflow-hidden rounded-[16px] border-[1.5px] border-[var(--border)] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${!product.in_stock ? 'opacity-55' : ''}`}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpen(product)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpen(product);
                }
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-inset"
            >
            <div className="relative flex h-24 items-center justify-center bg-[linear-gradient(135deg,#F7F4EF,#EEE9DF)]">
              <Package className="h-10 w-10 text-[var(--gold-dark)]/45" strokeWidth={1.25} />
              {product.badge ? (
                <span className="absolute left-2 top-2 rounded-full bg-[var(--void)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--gold)]">
                  {product.badge}
                </span>
              ) : null}
              {!product.in_stock ? (
                <span className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-3)]">
                  Sold out
                </span>
              ) : null}
              <button
                type="button"
                aria-label={`Open details for ${product.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(product);
                }}
                className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-[9px] bg-white/90 text-[var(--gold-dark)] shadow-sm"
              >
                <Plus className="h-3.5 w-3.5 rotate-45" aria-hidden="true" />
              </button>
            </div>
            <div className="p-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--gold-dark)]">{product.category ?? 'Shop'}</p>
              <p className="mt-1 text-[13px] font-semibold text-[var(--text-1)]">{product.name}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[var(--text-4)]" title={product.description} aria-label={product.description}>
                {product.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-[15px] font-bold text-[var(--text-1)]">{formatPrice(product.price)}</span>
                  {product.original_price ? (
                    <span className="ml-1 text-[11px] text-[var(--text-6)] line-through">{formatPrice(product.original_price)}</span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onAdd(product);
                  }}
                  disabled={!product.in_stock || reachedCartLimit}
                  className={`flex h-7 w-7 items-center justify-center rounded-[9px] text-sm ${inCart(product.id) ? 'bg-[var(--gold)] text-[var(--void)]' : 'bg-[var(--surface-3)] text-[var(--text-2)]'} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {inCart(product.id) ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            </div>
          </motion.div>
            );
          })()
        ))}
      </div>
      </div>
    </section>
  );
}
