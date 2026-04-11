import type { ServiceRecord } from '@/types';

export function ServiceForm({ service }: { service?: ServiceRecord }) {
  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <h2 className="font-display text-4xl">{service ? 'Edit service' : 'Add service'}</h2>
      <div className="mt-5 grid gap-3">
        <input defaultValue={service?.emoji} className="rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Emoji" />
        <input defaultValue={service?.name} className="rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Name" />
        <textarea defaultValue={service?.description} className="min-h-[120px] rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Description" />
        <div className="grid grid-cols-2 gap-3">
          <input defaultValue={service?.duration_minutes} className="rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Duration" />
          <input defaultValue={service ? service.price / 100 : ''} className="rounded-xl border border-[var(--color-border)] px-4 py-3" placeholder="Price" />
        </div>
        <button className="rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white">
          {service ? 'Save changes' : 'Create service'}
        </button>
      </div>
    </div>
  );
}
