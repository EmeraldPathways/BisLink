'use client';

import { CalendarDays, House, Menu, MessageCircle, ShoppingBag } from 'lucide-react';

type MobileNavId = 'home' | 'bookings' | 'products' | 'contact' | 'more';

export function MobileBottomNav({
  activeItem,
  onNavigate,
  onMore,
  canBook,
  canShop
}: {
  activeItem: MobileNavId;
  onNavigate: (id: Exclude<MobileNavId, 'more'>) => void;
  onMore: () => void;
  canBook: boolean;
  canShop: boolean;
}) {
  const items = [
    { id: 'home' as const, label: 'Home', icon: House, enabled: true },
    { id: 'bookings' as const, label: 'Book', icon: CalendarDays, enabled: canBook },
    { id: 'products' as const, label: 'Shop', icon: ShoppingBag, enabled: canShop },
    { id: 'contact' as const, label: 'Contact', icon: MessageCircle, enabled: true },
    { id: 'more' as const, label: 'More', icon: Menu, enabled: true }
  ];

  return (
    <nav aria-label="Mobile page navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--page-border)] bg-[color:color-mix(in_srgb,var(--page-card-bg)_94%,white)] px-3 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 shadow-[0_-12px_34px_rgba(43,24,7,0.08)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const active = item.id === activeItem;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => (item.id === 'more' ? onMore() : onNavigate(item.id))}
              disabled={!item.enabled}
              className={`relative flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] transition ${
                active ? 'text-[var(--cta-bg)]' : 'text-[var(--text-3)]'
              } ${item.enabled ? '' : 'cursor-not-allowed opacity-40'}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="font-medium">{item.label}</span>
              {active ? <span className="absolute inset-x-0 top-0 mx-auto h-1 w-10 rounded-b-full bg-[var(--accent)]" /> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
