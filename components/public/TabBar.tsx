'use client';

import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export type PublicSectionId = 'bookings' | 'portfolio' | 'products' | 'about' | 'reviews' | 'contact';

export function TabBar({
  sections,
  activeSection,
  onNavigate
}: {
  sections: Array<{
    id: PublicSectionId;
    label: string;
    icon: LucideIcon;
  }>;
  activeSection: PublicSectionId;
  onNavigate: (id: PublicSectionId) => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <nav aria-label="Public page sections" className="border-t border-[var(--tab-border)]">
      <LayoutGroup>
        <div className="flex px-2">
          {sections.map((section) => {
            const active = section.id === activeSection;
            const Icon = section.icon;

            return (
              <button
                key={section.id}
                type="button"
                aria-current={active ? 'true' : undefined}
                onClick={() => onNavigate(section.id)}
                className={`relative flex-1 px-2 py-3 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[-2px] ${
                  active ? 'text-[var(--nav-active)]' : 'text-[var(--nav-text)]'
                }`}
              >
                <div className="flex justify-center">
                  <Icon className="h-[14px] w-[14px]" aria-hidden="true" />
                </div>
                <div className="mt-1 text-[11px] font-medium">{section.label}</div>
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
