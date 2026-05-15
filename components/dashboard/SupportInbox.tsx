'use client';

import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState, useTransition } from 'react';
import { LifeBuoy, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { SupportTicketRecord } from '@/types';

type TicketFilter = 'all' | 'open' | 'in_progress' | 'resolved';

export function SupportInbox({
  tickets,
  counts,
  statuses,
}: {
  tickets: SupportTicketRecord[];
  counts: {
    open: number;
    inProgress: number;
    resolved: number;
    highPriority: number;
  };
  statuses: {
    stripe: { label: string; tone: 'good' | 'warn' };
    calendar: { label: string; tone: 'good' | 'warn' };
    contact: { label: string; tone: 'good' | 'warn' };
    orders: { label: string; tone: 'good' | 'warn' };
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<TicketFilter>('all');
  const [form, setForm] = useState({ subject: '', message: '' });

  const filteredTickets = useMemo(() => {
    if (filter === 'all') {
      return tickets;
    }

    return tickets.filter((ticket) => ticket.status === filter);
  }, [filter, tickets]);

  async function updateTicket(
    id: string,
    body: Record<string, unknown>,
    fallbackError: string
  ) {
    setError(null);
    setPendingId(id);

    const response = await fetch(`/api/owner/support/${id}`, {
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

  async function submitOwnerRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const response = await fetch('/api/owner/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: form.subject,
        message: form.message
      })
    });

    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    if (!response.ok) {
      setFormError(data?.error ?? 'Could not send support request');
      return;
    }

    setForm({ subject: '', message: '' });
    setFormSuccess('Support request sent to admin.');
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-5xl">Settings</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Manage business support, communication status, and platform help in
          one place.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <StatusCard label="Stripe" value={statuses.stripe.label} tone={statuses.stripe.tone} />
        <StatusCard
          label="Calendar"
          value={statuses.calendar.label}
          tone={statuses.calendar.tone}
        />
        <StatusCard
          label="Contact"
          value={statuses.contact.label}
          tone={statuses.contact.tone}
        />
        <StatusCard label="Orders" value={statuses.orders.label} tone={statuses.orders.tone} />
      </div>

      <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl">Public support inbox</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Messages submitted from your public page contact form.
            </p>
          </div>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as TicketFilter)}
            className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="mt-4 space-y-3">
          {filteredTickets.length ? (
            filteredTickets.map((ticket) => {
              const disabled = isPending && pendingId === ticket.id;
              return (
                <article
                  key={ticket.id}
                  className="rounded-[22px] border border-[var(--color-border)] bg-white p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {ticket.customer_name ?? 'Public user'}
                        </p>
                        <Badge>{ticket.ticket_type === 'escalation' ? 'Escalated' : 'Public support'}</Badge>
                        <Badge tone={ticket.priority === 'high' ? 'warning' : 'default'}>
                          {ticket.priority === 'high' ? 'High priority' : 'Normal priority'}
                        </Badge>
                        <Badge tone={statusTone(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {ticket.customer_email ? (
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {ticket.customer_email}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        {formatTimestamp(ticket.created_at)}
                      </p>
                    </div>
                    {ticket.assigned_admin_email ? (
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Admin owner: {ticket.assigned_admin_email}
                      </p>
                    ) : null}
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-primary)]">
                    {ticket.message}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionButton
                      disabled={disabled}
                      label="Open"
                      onClick={() =>
                        updateTicket(ticket.id, { status: 'open' }, 'Could not reopen ticket')
                      }
                    />
                    <ActionButton
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
                    <ActionButton
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
                    <ActionButton
                      disabled={disabled}
                      label={ticket.priority === 'high' ? 'Set normal priority' : 'Set high priority'}
                      onClick={() =>
                        updateTicket(
                          ticket.id,
                          { priority: ticket.priority === 'high' ? 'normal' : 'high' },
                          'Could not update priority'
                        )
                      }
                    />
                    {ticket.ticket_type === 'public_support' ? (
                      <ActionButton
                        disabled={disabled}
                        label="Escalate to admin"
                        tone="dark"
                        onClick={() =>
                          updateTicket(
                            ticket.id,
                            { escalate: true, status: 'in_progress' },
                            'Could not escalate ticket'
                          )
                        }
                      />
                    ) : null}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[22px] bg-white px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">
              No support tickets matched the current filter.
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-4">
        <CountCard label="Open" value={counts.open} />
        <CountCard label="In progress" value={counts.inProgress} />
        <CountCard label="Resolved" value={counts.resolved} />
        <CountCard label="High priority" value={counts.highPriority} />
      </div>

      <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-[var(--color-surface-2)] p-3 text-[var(--color-gold-dark)]">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-3xl">Ask admin for help</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Use this for business-owner questions about the platform, payments,
              or account support.
            </p>
          </div>
        </div>

        <form onSubmit={submitOwnerRequest} className="mt-5 space-y-3">
          <input
            value={form.subject}
            onChange={(event) =>
              setForm((current) => ({ ...current, subject: event.target.value }))
            }
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3"
            placeholder="Subject"
            minLength={3}
            maxLength={120}
            required
          />
          <textarea
            value={form.message}
            onChange={(event) =>
              setForm((current) => ({ ...current, message: event.target.value }))
            }
            className="min-h-[120px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3"
            placeholder="What do you need help with?"
            minLength={10}
            maxLength={2000}
            required
          />
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          {formSuccess ? (
            <p className="text-sm text-green-700">{formSuccess}</p>
          ) : null}
          <button
            disabled={isPending}
            className="rounded-xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            Send support request
          </button>
        </form>
      </section>

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <TriangleAlert className="h-4 w-4" />
          {error}
        </div>
      ) : null}
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
        {label}
      </p>
      <p className="mt-2 font-display text-4xl text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}

function StatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'good' | 'warn';
}) {
  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
        {label}
      </p>
      <p
        className={`mt-2 text-sm font-semibold ${
          tone === 'good' ? 'text-emerald-700' : 'text-amber-700'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  disabled,
  label,
  onClick,
  tone = 'default'
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'dark';
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-[13px] font-medium disabled:opacity-60 ${
        tone === 'dark'
          ? 'bg-[var(--color-void)] text-white'
          : 'border border-[var(--color-border)] bg-white'
      }`}
    >
      {label}
    </button>
  );
}

function Badge({
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

function statusTone(status: SupportTicketRecord['status']) {
  return status === 'resolved' ? 'success' : status === 'in_progress' ? 'warning' : 'default';
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}
