import { Check, Clock, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatting';
import type { Service } from './BookingPage';

export function ServiceCard({
  service,
  onClick
}: {
  service: Service;
  onClick: () => void;
}) {
  const iconLabel = service.emoji?.trim() || '*';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-[20px] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] text-left shadow-[var(--card-shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--card-hover-shadow)] active:scale-[0.98]"
    >
      <div className="relative flex h-24 items-center justify-center bg-[image:var(--media-gradient)]">
        <div className="text-[34px] text-[var(--accent-strong)]" aria-hidden="true">
          {iconLabel}
        </div>
        {service.tag ? (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--badge-soft-bg)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--accent-strong)]">
            {service.tag}
          </span>
        ) : null}
        <div
          className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-[9px] text-[var(--accent-strong)] shadow-sm"
          style={{ backgroundColor: 'color-mix(in srgb, var(--page-card-bg) 90%, transparent)' }}
        >
          <Check className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
          <Plus className="absolute h-3.5 w-3.5 transition group-hover:opacity-0" aria-hidden="true" />
        </div>
      </div>

      <div className="p-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--accent-strong)]">
          {service.tag ?? 'Book'}
        </p>
        <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.02em] text-[var(--text-1)]">
          {service.name}
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[var(--text-4)]" title={service.description} aria-label={service.description}>
          {service.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-bold text-[var(--text-1)]">
              {formatPrice(service.price, service.currency)}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-3)]">
              <Clock className="h-3 w-3" /> {service.duration_minutes} min
            </span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[var(--page-surface-emphasis)] text-[var(--text-2)]">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
        </div>
      </div>
    </button>
  );
}
