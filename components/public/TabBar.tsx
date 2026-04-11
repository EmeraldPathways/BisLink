'use client';

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
  return (
    <div className="border-t border-white/10">
      <div className="flex overflow-x-auto px-2">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative flex-1 px-2 py-3 text-center transition ${active ? 'text-[var(--color-gold)]' : 'text-[#555]'}`}
            >
              <div className="flex justify-center">
                <Icon className="h-[14px] w-[14px]" />
              </div>
              <div className="mt-1 text-[11px] font-medium">{tab.label}</div>
              {active ? <span className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-6 rounded-t-sm bg-[var(--color-gold)]" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
