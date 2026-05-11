'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check, Package, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatting';
import type { BusinessProfile, ProductRecord } from '@/types';
import { SectionImageHeader } from '@/components/public/SectionImageHeader';

export function ProductsTab({
  id = 'products',
  business,
  products,
  categories,
  activeCategory,
  onCategoryChange,
  onOpen,
  onAdd,
  inCart,
  getQuantity
}: {
  id?: string;
  business: BusinessProfile;
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
    <section id={id} className="scroll-mt-20 px-2 pb-8 pt-3">
      <div className="overflow-hidden rounded-[32px] border border-[var(--page-border)] bg-[var(--page-card-bg)] shadow-[var(--card-shadow)]">
        <SectionImageHeader
          title={business.products_title?.trim() || 'Shop'}
          subtitle={business.products_subtitle?.trim() || 'Studio essentials, recovery tools, and digital plans you can buy in seconds.'}
          imageUrl={business.products_image_url ?? business.cover_image_url}
          compact
          attached
        />
        <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => {
              const active = category === activeCategory;
              return (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${active ? 'border-[var(--cta-bg)] bg-[var(--cta-bg)] text-[var(--cta-text)]' : 'border-[var(--border)] bg-[var(--page-card-bg)] text-[var(--text-3)]'}`}
                >
                  {category}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.map((product, index) => {
              const quantity = getQuantity(product.id);
              const reachedCartLimit = quantity >= 10;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * index }}
                  className={`overflow-hidden rounded-[20px] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] text-left shadow-[var(--card-shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--card-hover-shadow)] ${!product.in_stock ? 'opacity-55' : ''}`}
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
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[image:var(--media-gradient)]">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 220px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-10 w-10" style={{ color: 'color-mix(in srgb, var(--accent-strong) 45%, transparent)' }} strokeWidth={1.25} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10" />
                      {product.badge ? (
                        <span className="absolute left-2 top-2 rounded-full bg-[var(--badge-bg)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--badge-text)]">
                          {product.badge}
                        </span>
                      ) : null}
                      {!product.in_stock ? (
                        <span className="absolute right-2 top-2 rounded-full bg-[var(--page-card-bg)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-3)]">
                          Sold out
                        </span>
                      ) : null}
                    </div>
                    <div className="p-3">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--accent-strong)]">{product.category ?? 'Shop'}</p>
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
                          className={`flex h-7 w-7 items-center justify-center rounded-[9px] text-sm ${inCart(product.id) ? 'bg-[var(--cta-accent-bg)] text-[var(--cta-accent-text)]' : 'bg-[var(--page-surface-emphasis)] text-[var(--text-2)]'} disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {inCart(product.id) ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
