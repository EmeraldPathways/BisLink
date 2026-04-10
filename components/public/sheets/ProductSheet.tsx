'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils/formatting';
import type { ProductRecord } from '@/types';

export function ProductSheet({
  product,
  inCart,
  onClose,
  onAdd,
  onViewCart
}: {
  product: ProductRecord | null;
  inCart: boolean;
  onClose: () => void;
  onAdd: (product: ProductRecord) => void;
  onViewCart: () => void;
}) {
  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={onClose} />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          className="absolute bottom-0 left-0 right-0 mx-auto max-w-[430px] rounded-t-[26px] bg-white px-4 pb-6 pt-3 shadow-[0_-24px_64px_rgba(0,0,0,0.22)]"
        >
          <div className="mx-auto mb-4 h-1 w-[38px] rounded bg-[#e0e0e0]" />
          <div className="flex items-center justify-between">
            <p className="font-display text-[24px] text-[var(--text-1)]">{product.name}</p>
            <button className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--surface-3)]" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="mt-4 flex h-[140px] items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#F7F4EF,#EEE9DF)] text-6xl">
            {product.emoji}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-display text-[24px] text-[var(--text-1)]">{formatPrice(product.price)}</p>
              <p className="mt-1 text-sm text-[var(--text-3)]">
                {product.rating.toFixed(1)} ★ · {product.review_count} reviews
              </p>
            </div>
            {!product.in_stock ? <span className="rounded-full bg-[var(--surface-3)] px-3 py-1 text-xs font-semibold text-[var(--text-3)]">Sold out</span> : null}
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--text-2)]">{product.description}</p>
          <button
            disabled={!product.in_stock}
            onClick={() => (inCart ? onViewCart() : onAdd(product))}
            className="mt-6 w-full rounded-[15px] bg-[var(--void)] px-5 py-4 text-sm font-semibold text-white disabled:bg-[var(--surface-3)] disabled:text-[var(--text-5)]"
          >
            {!product.in_stock ? 'Out of Stock' : inCart ? '✓ Added — View Cart' : `Add to Cart — ${formatPrice(product.price)}`}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
