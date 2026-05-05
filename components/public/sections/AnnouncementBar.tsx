import type { BusinessProfile } from '@/types';

export function AnnouncementBar({ business }: { business: BusinessProfile }) {
  if (!business.announcement_enabled || !business.announcement_text?.trim()) {
    return null;
  }

  return (
    <section className="px-0 pt-4 md:px-4">
      <div className="rounded-none bg-[var(--accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--text-1)]">
        {business.announcement_text}
      </div>
    </section>
  );
}
