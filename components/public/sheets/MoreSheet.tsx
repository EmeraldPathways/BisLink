'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BriefcaseBusiness, ChevronRight, MapPin, MessageCircle, Star, X } from 'lucide-react';

type MoreItem = 'portfolio' | 'contact' | 'reviews';

export function MoreSheet({
  open,
  showPortfolio,
  showContact,
  showReviews,
  onClose,
  onSelect
}: {
  open: boolean;
  showPortfolio: boolean;
  showContact: boolean;
  showReviews: boolean;
  onClose: () => void;
  onSelect: (item: MoreItem) => void;
}) {
  if (!open) return null;

  const items = [
    showPortfolio
      ? {
          id: 'portfolio' as const,
          title: 'Work',
          description: 'See recent portfolio and featured results.',
          icon: BriefcaseBusiness
        }
      : null,
    showContact
      ? {
          id: 'contact' as const,
          title: 'Contact',
          description: 'Location, details, and message form.',
          icon: MessageCircle
        }
      : null,
    showReviews
      ? {
          id: 'reviews' as const,
          title: 'Reviews',
          description: 'Read client feedback and ratings.',
          icon: Star
        }
      : null
  ].filter(Boolean) as Array<{
    id: MoreItem;
    title: string;
    description: string;
    icon: typeof MapPin;
  }>;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button type="button" className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={onClose} />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          className="absolute bottom-0 left-0 right-0 mx-auto max-w-[520px] rounded-t-[30px] bg-[var(--sheet-bg)] px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3 shadow-[var(--panel-shadow)]"
        >
          <div className="mx-auto mb-4 h-1 w-[38px] rounded bg-[var(--sheet-handle)]" />
          <div className="flex items-center justify-between">
            <p className="font-display text-[24px] text-[var(--text-1)]">More</p>
            <button type="button" aria-label="Close more menu" className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--page-surface-emphasis)]" onClick={onClose}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 rounded-[var(--card-radius)] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)]">
            {items.length ? (
              items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.id}>
                    <button type="button" onClick={() => onSelect(item.id)} className="flex w-full items-center justify-between px-4 py-4 text-left">
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--page-surface-muted)] text-[var(--accent-strong)]">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[var(--text-1)]">{item.title}</span>
                          <span className="block text-sm text-[var(--text-3)]">{item.description}</span>
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-[var(--text-4)]" />
                    </button>
                    {index < items.length - 1 ? <div className="mx-4 h-px bg-[var(--border)]" /> : null}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-5 text-sm text-[var(--text-3)]">No extra sections are available for this page.</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
