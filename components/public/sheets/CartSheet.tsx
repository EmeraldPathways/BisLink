'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils/formatting';
import type { CartLine } from '@/hooks/useCart';

export function CartSheet({
  open,
  items,
  total,
  onClose,
  onCheckout
}: {
  open: boolean;
  items: CartLine[];
  total: number;
  onClose: () => void;
  onCheckout: () => void;
}) {
  if (!open) return null;

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
            <p className="font-display text-[24px] text-[var(--text-1)]">Your Cart</p>
            <button className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--surface-3)]" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between rounded-[16px] bg-[var(--surface-2)] px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-1)]">{item.product.name}</p>
                  <p className="text-sm text-[var(--text-3)]">
                    {item.qty} × {formatPrice(item.product.price)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--text-1)]">{formatPrice(item.product.price * item.qty)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[15px] bg-[var(--surface-2)] px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--text-1)]">Total</span>
              <span className="text-[18px] font-bold text-[var(--text-1)]">{formatPrice(total)}</span>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <input className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Customer name" />
            <input className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Email" />
            <input className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Shipping address (if needed)" />
          </div>
          <button onClick={onCheckout} className="mt-6 w-full rounded-[15px] bg-[var(--void)] px-5 py-4 text-sm font-semibold text-white">
            Pay {formatPrice(total)}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
