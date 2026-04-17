import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { requireAdminUser } from '@/lib/admin';
import { getAdminSettingsData } from '@/lib/admin-console-data';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireAdminUser();
  const { groups } = await getAdminSettingsData();

  return (
    <div className="space-y-6">
      <AdminTopbar title="Admin settings" description="Internal settings and environment visibility for the BisLink platform itself, separate from owner-facing business settings." />

      <div className="grid gap-5 xl:grid-cols-3">
        {groups.map((group) => (
          <section key={group.title} className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
            <h2 className="font-display text-4xl">{group.title}</h2>
            <div className="mt-5 space-y-3">
              {group.items.map((item) => (
                <div key={item.label} className="rounded-[20px] bg-[var(--color-surface-2)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">{item.label}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        item.state === 'configured'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.state === 'missing'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.state}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">{item.value}</p>
                  {item.details?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.details.map((detail) => (
                        <span key={detail} className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                          {detail}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
