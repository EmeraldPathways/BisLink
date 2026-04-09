import { formatPrice } from '@/lib/utils/formatting';
import { Service } from './BookingPage';

export function ServiceCard({ service, onClick }: { service: Service; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative w-full rounded-3xl border-[1.5px] border-[var(--color-border)] bg-white p-[18px] text-left transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] active:scale-[0.98]">
      {service.tag ? <span className="absolute right-4 top-2 rounded-full bg-[var(--color-void)] px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-[var(--color-gold)]">{service.tag}</span> : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold">{service.emoji} {service.name}</p>
          <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{service.description}</p>
          <p className="mt-2 text-[13px] text-[var(--color-text-tertiary)]">⏱ {service.duration_minutes} min <span className="ml-2 text-base font-bold text-black">{formatPrice(service.price)}</span></p>
        </div>
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-zinc-100 text-sm">→</div>
      </div>
    </button>
  );
}
