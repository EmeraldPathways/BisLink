import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { requireAdminUser } from '@/lib/admin';
import { getAdminAgentsData } from '@/lib/admin-console-data';

export const dynamic = 'force-dynamic';

export default async function AdminAgentsPage() {
  await requireAdminUser();
  const { diagnostics, cards } = await getAdminAgentsData();

  return (
    <div className="space-y-6">
      <AdminTopbar title="Agent area" description="Track the internal AI workers that support booking, support, business advice, and operational monitoring." />

      <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-dark)]">Overall status</p>
            <h2 className="mt-2 font-display text-4xl">{diagnostics.overallStatus}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard label="OK" value={String(diagnostics.summary.ok)} />
            <SummaryCard label="Warn" value={String(diagnostics.summary.warn)} />
            <SummaryCard label="Fail" value={String(diagnostics.summary.fail)} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {cards.map((agent) => (
          <article key={agent.id} className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-dark)]">{agent.name}</p>
                <h2 className="mt-2 font-display text-4xl">{agent.label}</h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  agent.level === 'ok' ? 'bg-emerald-50 text-emerald-700' : agent.level === 'warn' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {agent.state}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{agent.summary}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] bg-[var(--color-surface-2)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">Level</p>
                <p className="mt-2 text-sm font-semibold">{agent.level}</p>
              </div>
              <div className="rounded-[20px] bg-[var(--color-surface-2)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">Last run</p>
                <p className="mt-2 text-sm font-semibold">{new Date(agent.lastRun).toLocaleString()}</p>
              </div>
            </div>
            {agent.details.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {agent.details.map((detail) => (
                  <span key={detail} className="rounded-full bg-[var(--color-surface-2)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                    {detail}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-[var(--color-surface-2)] px-4 py-3 text-center">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
