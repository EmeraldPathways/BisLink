import { ArrowUpRight, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatting';
import { Service } from './BookingPage';

export function ServiceCard({ service, onClick }: { service: Service; onClick: () => void }) {
  const isLightTag = service.tag === 'Start Here';

  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-[18px] border-[1.5px] border-[var(--color-border)] bg-white p-[18px] pb-[52px] text-left transition duration-150 hover:-translate-y-0.5 hover:border-[#d4d4d0] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] active:scale-[0.98]"
    >
      {service.tag ? (
        <span
          className={`absolute bottom-4 right-4 z-10 rounded-full px-[9px] py-[3px] text-[9px] font-semibold uppercase tracking-[0.08em] ${
            isLightTag
              ? 'bg-[var(--color-gold-muted)] text-[var(--color-gold-dark)]'
              : 'bg-[var(--color-void)] text-[var(--color-gold)]'
          }`}
        >
          {service.tag}
        </span>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{service.name}</p>
          <p className="mt-1 max-w-[24rem] text-[13px] leading-5 text-[var(--color-text-secondary)]">{service.description}</p>
          <p className="mt-3 flex items-center gap-1 text-[13px] text-[var(--color-text-tertiary)]">
            <Clock className="h-3 w-3" /> {service.duration_minutes} min
            <span className="ml-2 text-[16px] font-bold text-[var(--color-text-primary)]">
              {formatPrice(service.price, service.currency)}
            </span>
          </p>
        </div>
        <div className="flex h-[30px] w-[30px] translate-x-0 items-center justify-center rounded-[10px] bg-[#f2f2f0] text-[#555] transition group-hover:translate-x-0.5 group-hover:bg-[var(--color-void)] group-hover:text-[var(--color-gold)]">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </button>
  );
}
