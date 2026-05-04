'use client';

import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, MessageCircle, ShoppingBag, Star, User, type LucideIcon } from 'lucide-react';

const tabs: { id: 'bookings' | 'products' | 'reviews' | 'about' | 'contact'; icon: LucideIcon; label: string }[] = [
  { id: 'bookings', icon: CalendarDays, label: 'Bookings' },
  { id: 'products', icon: ShoppingBag, label: 'Products' },
  { id: 'reviews', icon: Star, label: 'Reviews' },
  { id: 'about', icon: User, label: 'About' },
  { id: 'contact', icon: MessageCircle, label: 'Contact' }
];

export type PublicTab = (typeof tabs)[number]['id'];

export function TabBar({ activeTab, onChange }: { activeTab: PublicTab; onChange: (tab: PublicTab) => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <nav aria-label="Public page sections" role="tablist" className="border-t border-[var(--tab-border)]">
      <LayoutGroup>
        <div className="flex px-2">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${tab.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => onChange(tab.id)}
                className={`relative flex-1 px-2 py-3 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[-2px] ${
                  active ? 'text-[var(--nav-active)]' : 'text-[var(--nav-text)]'
                }`}
              >
                <div className="flex justify-center">
                  <Icon className="h-[14px] w-[14px]" aria-hidden="true" />
                </div>
                <div className="mt-1 text-[11px] font-medium">{tab.label}</div>
                {active ? (
                  <motion.span
                    layoutId={shouldReduceMotion ? undefined : 'public-tab-indicator'}
                    className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-6 rounded-t-sm bg-[var(--nav-indicator)]"
                    transition={{ duration: 0.2 }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </nav>
  );
}
