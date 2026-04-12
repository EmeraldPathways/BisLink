import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { agentAdminCards } from '@/lib/admin-data';

export default function AdminAgentsPage() {
  return (
    <div className="space-y-6">
      <AdminTopbar title="Agent area" description="Track the internal AI workers that support booking, support, business advice, and operational monitoring." />

      <div className="grid gap-5 xl:grid-cols-2">
        {agentAdminCards.map((agent) => (
          <article key={agent.id} className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-dark)]">{agent.owner}</p>
                <h2 className="mt-2 font-display text-4xl">{agent.name}</h2>
              </div>
              <span className="rounded-full bg-[var(--color-surface-2)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-primary)]">
                {agent.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{agent.summary}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] bg-[var(--color-surface-2)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">Model</p>
                <p className="mt-2 text-sm font-semibold">{agent.model}</p>
              </div>
              <div className="rounded-[20px] bg-[var(--color-surface-2)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">Last run</p>
                <p className="mt-2 text-sm font-semibold">{agent.lastRun}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
