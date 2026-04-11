import { ServiceForm } from '@/components/dashboard/ServiceForm';
import { demoServices } from '@/lib/demo-data';
import { formatPrice } from '@/lib/utils/formatting';

export default function Page() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-5xl">Services</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Reorder, edit, and toggle what shows on the public link.</p>
        </div>
        {demoServices.map((service) => (
          <div key={service.id} className="rounded-[24px] border border-[var(--color-border)] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {service.emoji} {service.name}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{service.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatPrice(service.price)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">{service.tag ?? 'Active'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ServiceForm service={demoServices[0]} />
    </div>
  );
}
