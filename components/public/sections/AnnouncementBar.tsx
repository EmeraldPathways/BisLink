import type { BusinessProfile } from '@/types';

export function AnnouncementBar({ business }: { business: BusinessProfile }) {
  if (!business.announcement_enabled || !business.announcement_text?.trim()) {
    return null;
  }

  return (
    <section className="px-4 pt-4">
      <div className="rounded-[var(--card-radius)] bg-[var(--accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--text-1)]">
        {business.announcement_text}
      </div>
    </section>
  );
}
