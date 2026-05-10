import Image from 'next/image';
import { CalendarDays, Clock, Eye, UserRound } from 'lucide-react';
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
      className="group w-full overflow-hidden rounded-[20px] border-[1.5px] border-[var(--border)] bg-[var(--page-card-bg)] text-left shadow-[var(--card-shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--card-hover-shadow)] active:scale-[0.98]"
    >
      <div className="relative aspect-square overflow-hidden bg-[image:var(--media-gradient)]">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={service.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 220px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {iconLabel ? (
              <span className="text-[42px] leading-none text-[var(--accent-strong)]" aria-hidden="true">
                {iconLabel}
              </span>
            ) : (
              <UserRound className="h-10 w-10 text-[var(--accent-strong)]" strokeWidth={1.5} aria-hidden="true" />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10" />
        {service.tag ? (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--badge-bg)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--badge-text)]">
            {service.tag}
          </span>
        ) : null}
        <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-[9px] bg-white/85 text-[var(--accent-strong)] shadow-sm">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </div>

      <div className="p-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--accent-strong)]">Bookings</p>
        <p className="mt-1 text-[13px] font-semibold text-[var(--text-1)]">{service.name}</p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[var(--text-4)]" title={service.description} aria-label={service.description}>
          {service.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-[15px] font-bold text-[var(--text-1)]">{formatPrice(service.price, service.currency)}</span>
            <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-[var(--text-4)]">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.75} /> {service.duration_minutes} min
            </span>
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[var(--page-surface-emphasis)] text-[var(--text-2)]">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  );
}
