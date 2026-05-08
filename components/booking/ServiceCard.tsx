import { ArrowRight, Clock, UserRound } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatting';
import type { Service } from './BookingPage';

export function ServiceCard({
  service,
  onClick
}: {
  service: Service;
  onClick: () => void;
}) {
  const iconLabel = service.emoji?.trim();

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-[28px] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] text-left shadow-[var(--card-shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--card-hover-shadow)] active:scale-[0.98]"
    >
      <div className="p-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[image:var(--media-gradient)] text-[var(--accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          {iconLabel ? (
            <span className="text-[34px] leading-none" aria-hidden="true">
              {iconLabel}
            </span>
          ) : (
            <UserRound className="h-9 w-9" strokeWidth={1.5} aria-hidden="true" />
          )}
        </div>

        <p className="mt-5 max-w-[10ch] text-[17px] font-semibold leading-[1.05] text-[var(--text-1)] sm:text-[18px]">
          {service.name}
        </p>
        <p className="mt-3 max-w-[18ch] text-[13px] leading-[1.45] text-[var(--text-3)] sm:text-[14px]" title={service.description} aria-label={service.description}>
          {service.description}
        </p>

        <div className="mt-5 h-px bg-[var(--border)]" />

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[15px] text-[var(--text-3)]">
            <Clock className="h-4 w-4" strokeWidth={1.75} /> {service.duration_minutes} min
          </span>
          <span className="text-[18px] font-bold text-[var(--text-1)]">
            {formatPrice(service.price, service.currency)}
          </span>
        </div>

        <div className="mt-5 rounded-[16px] bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-5 py-3.5 text-center text-[18px] font-semibold text-white shadow-[0_14px_30px_rgba(139,104,37,0.18)] transition group-hover:brightness-[1.03]">
          <span className="inline-flex items-center gap-2">
            Book
            <ArrowRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  );
}
