'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export function LinkMobileSheet({
  open,
  title,
  description,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close editor"
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          className="hide-scrollbar absolute bottom-0 left-0 right-0 max-h-[88dvh] overflow-y-auto rounded-t-[30px] bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3 shadow-[0_-20px_60px_rgba(0,0,0,0.25)]"
        >
          <div className="mx-auto mb-4 h-1 w-[38px] rounded bg-[var(--color-border)]" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-[26px] text-[var(--color-text-primary)]">{title}</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close editor"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[var(--color-border)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
