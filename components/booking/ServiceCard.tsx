import { Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatting';
import type { Service } from './BookingPage';

export function ServiceCard({
  service,
  onClick
}: {
  service: Service;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-[20px] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] text-left shadow-[var(--card-shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--card-hover-shadow)] active:scale-[0.98]"
    >
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
        </div>
      </div>
    </button>
  );
}
