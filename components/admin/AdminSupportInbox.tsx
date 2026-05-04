'use client';

import type { ReactNode } from 'react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { SupportTicketRecord } from '@/types';

type AdminSupportTicket = SupportTicketRecord & {
  businessName: string;
};

export function AdminSupportInbox({
  tickets
}: {
  tickets: AdminSupportTicket[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateTicket(
    id: string,
    body: Record<string, unknown>,
    fallbackError: string
  ) {
    setError(null);
    setPendingId(id);

    const response = await fetch(`/api/admin/support/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(data?.error ?? fallbackError);
      setPendingId(null);
      return;
    }

    startTransition(() => {
      router.refresh();
      setPendingId(null);
    });
  }

  return (
    <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-4xl">Support inbox</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Owner-submitted issues and escalated public support tickets.
          </p>
        </div>
        <div className="rounded-full bg-[var(--color-surface-2)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)]">
          {tickets.length} tickets
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {tickets.length ? (
          tickets.map((ticket) => {
            const disabled = isPending && pendingId === ticket.id;
            return (
              <article
                key={ticket.id}
                className="rounded-[20px] border border-[var(--color-border)] p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">
                        {ticket.businessName}
                      </p>
                      <AdminBadge>{ticket.ticket_type.replace('_', ' ')}</AdminBadge>
                      <AdminBadge tone={ticket.priority === 'high' ? 'warning' : 'default'}>
                        {ticket.priority === 'high' ? 'High priority' : 'Normal priority'}
                      </AdminBadge>
                      <AdminBadge tone={ticket.status === 'resolved' ? 'success' : 'default'}>
                        {ticket.status.replace('_', ' ')}
                      </AdminBadge>
                    </div>
                    {ticket.subject ? (
                      <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">
                        {ticket.subject}
                      </p>
                    ) : null}
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-text-secondary)]">
                      {ticket.message}
                    </p>
                    <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                      {ticket.customer_name ?? 'Unknown sender'}
                      {ticket.customer_email ? ` • ${ticket.customer_email}` : ''}
                      {' • '}
                      {new Date(ticket.created_at).toLocaleString()}
                    </p>
                    {ticket.assigned_admin_email ? (
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        Assigned to {ticket.assigned_admin_email}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:max-w-[320px] lg:justify-end">
                    <AdminAction
                      disabled={disabled}
                      label="Assign to me"
                      onClick={() =>
                        updateTicket(
                          ticket.id,
                          { assignToSelf: true },
                          'Could not assign ticket'
                        )
                      }
                    />
                    <AdminAction
                      disabled={disabled}
                      label="In progress"
                      onClick={() =>
                        updateTicket(
                          ticket.id,
                          { status: 'in_progress' },
                          'Could not update ticket'
                        )
                      }
                    />
                    <AdminAction
                      disabled={disabled}
                      label="Resolve"
                      onClick={() =>
                        updateTicket(
                          ticket.id,
                          { status: 'resolved' },
                          'Could not resolve ticket'
                        )
                      }
                    />
                    <AdminAction
                      disabled={disabled}
                      label="Reopen"
                      onClick={() =>
                        updateTicket(
                          ticket.id,
                          { status: 'open' },
                          'Could not reopen ticket'
                        )
                      }
                    />
                    <AdminAction
                      disabled={disabled}
                      label={ticket.priority === 'high' ? 'Set normal' : 'Set high'}
                      onClick={() =>
                        updateTicket(
                          ticket.id,
                          { priority: ticket.priority === 'high' ? 'normal' : 'high' },
                          'Could not update priority'
                        )
                      }
                    />
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[20px] bg-[var(--color-surface-2)] p-4 text-sm text-[var(--color-text-secondary)]">
            No support tickets need admin attention.
          </div>
        )}
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}

function AdminAction({
  disabled,
  label,
  onClick
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium disabled:opacity-60"
    >
      {label}
    </button>
  );
}

function AdminBadge({
  children,
  tone = 'default'
}: {
  children: ReactNode;
  tone?: 'default' | 'warning' | 'success';
}) {
  const toneClass =
    tone === 'warning'
      ? 'bg-amber-100 text-amber-900'
      : tone === 'success'
        ? 'bg-emerald-100 text-emerald-900'
        : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]';

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}
