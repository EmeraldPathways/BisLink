'use client';

import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export function FloatingCartTab({
  count,
  onOpen,
}: {
  count: number;
  onOpen: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      onClick={onOpen}
      aria-label={`Open cart with ${count} item${count === 1 ? '' : 's'}`}
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-50 mx-auto flex h-12 w-fit min-w-[72px] items-center justify-center gap-2 rounded-t-[18px] rounded-b-[10px] border border-[var(--page-border)] bg-[var(--cta-bg)] px-4 text-[var(--cta-text)] shadow-[0_-8px_24px_rgba(43,24,7,0.18)] md:bottom-[calc(env(safe-area-inset-bottom)+5.35rem)]"
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      <span className="text-sm font-semibold">{count}</span>
    </motion.button>
  );
}
