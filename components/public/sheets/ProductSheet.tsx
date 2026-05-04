'use client';

import { type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, Package, Star, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { formatPrice } from '@/lib/utils/formatting';
import type { ProductRecord } from '@/types';

export function ProductSheet({
  product,
  inCart,
  onClose,
  onAdd,
  onViewCart,
  presentation = 'default',
  containerRef
}: {
  product: ProductRecord | null;
  inCart: boolean;
  onClose: () => void;
  onAdd: (product: ProductRecord) => void;
  onViewCart: () => void;
  presentation?: 'default' | 'demo';
  containerRef?: RefObject<HTMLDivElement>;
}) {
  const isMobile = useIsMobile();

  if (!product) return null;

  const framed = presentation === 'demo' && !isMobile && containerRef?.current;
  const shellClassName = framed ? 'absolute inset-0 z-50' : 'fixed inset-0 z-50';
  const panelClassName = framed
    ? 'hide-scrollbar absolute bottom-0 left-0 right-0 min-h-[78%] max-h-[calc(100%-8px)] w-full overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] rounded-t-[30px] bg-[var(--sheet-bg)] px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3 shadow-[var(--panel-shadow)]'
    : 'hide-scrollbar absolute bottom-0 left-0 right-0 mx-auto min-h-[78dvh] max-h-[calc(100dvh-8px)] w-full max-w-[520px] overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] rounded-t-[30px] bg-[var(--sheet-bg)] px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3 shadow-[var(--panel-shadow)] md:max-w-[430px] md:rounded-t-[26px] md:px-4';

  const sheet = (
    <AnimatePresence>
      <motion.div className={shellClassName} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button type="button" className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={onClose} />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          className={panelClassName}
        >
          <div className="mx-auto mb-4 h-1 w-[38px] rounded bg-[var(--sheet-handle)]" />
          <div className="flex items-center justify-between">
            <p className="font-display text-[24px] text-[var(--text-1)]">{product.name}</p>
            <button type="button" aria-label="Close product details" className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--page-surface-emphasis)]" onClick={onClose}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex h-[140px] items-center justify-center rounded-[18px] bg-[image:var(--media-gradient)]">
            <Package className="h-12 w-12 text-[var(--text-3)]" strokeWidth={1.25} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-display text-[24px] text-[var(--text-1)]">{formatPrice(product.price)}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-[var(--text-3)]">
                {product.rating.toFixed(1)}
                <Star className="h-3 w-3 fill-[var(--accent)] text-[var(--accent)]" />
                <span>· {product.review_count} reviews</span>
              </p>
            </div>
            {!product.in_stock ? <span className="rounded-full bg-[var(--page-surface-emphasis)] px-3 py-1 text-xs font-semibold text-[var(--text-3)]">Sold out</span> : null}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--accent-strong)]">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            Full product details
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--text-2)]">{product.description}</p>
          <button
            disabled={!product.in_stock}
            onClick={() => (inCart ? onViewCart() : onAdd(product))}
            className="mt-6 w-full rounded-[var(--button-radius)] bg-[var(--cta-bg)] px-5 py-4 text-sm font-semibold text-[var(--cta-text)] disabled:bg-[var(--page-surface-emphasis)] disabled:text-[var(--text-5)]"
          >
            {!product.in_stock ? 'Out of Stock' : inCart ? (
              <span className="flex items-center justify-center gap-2"><Check className="h-4 w-4" /> Added - View Cart</span>
            ) : `Add to Cart - ${formatPrice(product.price)}`}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return framed && containerRef?.current ? createPortal(sheet, containerRef.current) : sheet;
}
