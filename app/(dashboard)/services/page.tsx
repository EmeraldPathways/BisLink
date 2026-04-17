import { ServiceForm } from '@/components/dashboard/ServiceForm';
import { ServiceCardActions } from '@/components/dashboard/ServiceCardActions';
import { getServicesData } from '@/lib/dashboard-data';
import { formatPrice } from '@/lib/utils/formatting';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams?: { edit?: string } }) {
  const { services } = await getServicesData();
  const selectedService = services.find((service) => service.id === searchParams?.edit) ?? undefined;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-5xl">Services</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Reorder, edit, and toggle what shows on the public link.</p>
        </div>
        {services.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[var(--color-border)] bg-white p-12 text-center">
            <p className="font-display text-4xl text-[var(--color-text-secondary)]">No services yet</p>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              Use the form to add your first service and start taking bookings.
            </p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="rounded-[24px] border border-[var(--color-border)] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {service.emoji} {service.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{service.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPrice(service.price, service.currency)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">{service.tag ?? 'Active'}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <ServiceCardActions serviceId={service.id} isActive={service.is_active} />
              </div>
            </div>
          ))
        )}
      </div>
      <ServiceForm service={selectedService} />
    </div>
  );
}
