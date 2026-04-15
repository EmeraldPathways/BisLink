import type { ServiceRecord } from '@/types';

export function ServiceForm({ service }: { service?: ServiceRecord }) {
  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <h2 className="font-display text-4xl">{service ? 'Edit service' : 'Add service'}</h2>
      <div className="mt-5 grid gap-3">
        <input disabled defaultValue={service?.emoji} className="rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" placeholder="Emoji" />
        <input disabled defaultValue={service?.name} className="rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" placeholder="Name" />
        <textarea disabled defaultValue={service?.description} className="min-h-[120px] rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" placeholder="Description" />
        <div className="grid grid-cols-2 gap-3">
          <input disabled defaultValue={service?.duration_minutes} className="rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" placeholder="Duration" />
          <input disabled defaultValue={service ? service.price / 100 : ''} className="rounded-xl border border-[var(--color-border)] px-4 py-3 opacity-60" placeholder="Price" />
        </div>
        <button disabled className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white opacity-60">
          {service ? 'Save changes' : 'Create service'}
        </button>
        <p className="text-xs text-[var(--color-text-secondary)]">Service editing is scheduled for Phase 2.</p>
      </div>
    </div>
  );
}
