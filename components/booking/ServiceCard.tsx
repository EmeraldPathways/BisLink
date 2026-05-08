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
  const iconLabel = service.emoji?.trim() || '✨';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col rounded-[30px] border border-[var(--page-border)] bg-[var(--page-card-bg)] p-4 text-left transition duration-150 hover:-translate-y-0.5 hover:border-[var(--page-border-strong)] hover:shadow-[var(--card-hover-shadow)] active:scale-[0.98]"
      style={{ boxShadow: 'var(--card-shadow)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--page-surface-muted)] text-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <span aria-hidden="true">{iconLabel}</span>
        </div>
        {service.tag ? (
          <span className="inline-flex rounded-full bg-[var(--badge-soft-bg)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--accent-strong)]">
            {service.tag}
          </span>
        ) : (
          <span className="h-8" />
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <div className="min-h-[120px]">
          <p className="text-[18px] font-semibold leading-[1.02] text-[var(--color-text-primary)]">{service.name}</p>
          <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-secondary)]">{service.description}</p>
        </div>

        <div className="mt-4 border-t border-[var(--page-border)] pt-3">
          <div className="flex items-center justify-between gap-3 text-[var(--color-text-secondary)]">
            <p className="flex items-center gap-1.5 text-[13px]">
              <Clock className="h-3.5 w-3.5" /> {service.duration_minutes} min
            </p>
            <span className="text-[20px] font-bold text-[var(--color-text-primary)]">{formatPrice(service.price, service.currency)}</span>
          </div>

          <div className="mt-3 inline-flex w-full items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-4 py-3 text-[15px] font-semibold text-white">
            {'Book ->'}
          </div>
        </div>
      </div>
    </button>
  );
}
