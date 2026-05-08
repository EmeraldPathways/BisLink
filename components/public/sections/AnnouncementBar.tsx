import type { BusinessProfile } from '@/types';

export function AnnouncementBar({ business }: { business: BusinessProfile }) {
  if (!business.announcement_enabled || !business.announcement_text?.trim()) {
    return null;
  }

  return (
    <section className="px-4 pt-4 md:px-0">
      <div className="border border-[var(--page-border)] bg-[color:color-mix(in_srgb,var(--page-card-bg)_92%,white)] px-4 py-3 text-sm font-medium text-[var(--text-2)] shadow-[0_14px_34px_rgba(48,28,9,0.05)]">
        {business.announcement_text}
      </div>
    </section>
  );
}
