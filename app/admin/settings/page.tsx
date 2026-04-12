import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { adminSettingsGroups } from '@/lib/admin-data';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminTopbar title="Admin settings" description="Internal settings and environment visibility for the BisLink platform itself, separate from owner-facing business settings." />

      <div className="grid gap-5 xl:grid-cols-3">
        {adminSettingsGroups.map((group) => (
          <section key={group.title} className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
            <h2 className="font-display text-4xl">{group.title}</h2>
            <div className="mt-5 space-y-3">
              {group.items.map((item) => (
                <div key={item.label} className="rounded-[20px] bg-[var(--color-surface-2)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
