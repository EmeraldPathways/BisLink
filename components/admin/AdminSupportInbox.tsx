'use client';

import type { FormEvent, ReactNode } from 'react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { SupportMessageRecord } from '@/lib/agents/types';
import type {
  SupportDecisionRecord,
  SupportReviewLabel,
  SupportTicketRecord
} from '@/types';

type AdminSupportTicket = SupportTicketRecord & {
  businessName: string;
};

export function AdminSupportInbox({
  tickets,
  supportMessagesByConversationId,
  latestSupportDecisionsByConversationId,
  diagnosticsSummary,
  reviewedDecisionCount
}: {
  tickets: AdminSupportTicket[];
  supportMessagesByConversationId: Record<string, SupportMessageRecord[]>;
  latestSupportDecisionsByConversationId: Record<string, SupportDecisionRecord>;
  diagnosticsSummary: {
    total: number;
    needsReview: number;
    escalatedLater: number;
    clarifyingQuestions: number;
  };
  reviewedDecisionCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, string>>({});

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

  async function submitReply(event: FormEvent<HTMLFormElement>, ticket: AdminSupportTicket) {
    event.preventDefault();
    const draft = replyDrafts[ticket.id]?.trim();
    if (!draft) return;

    setError(null);
    setPendingId(ticket.id);

    const response = await fetch(`/api/admin/support/${ticket.id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: draft })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(data?.error ?? 'Could not send admin reply');
      setPendingId(null);
      return;
    }

    setReplyDrafts((current) => ({ ...current, [ticket.id]: '' }));
    startTransition(() => {
      router.refresh();
      setPendingId(null);
    });
  }

  async function submitReview(
    decisionId: string,
    reviewLabel: SupportReviewLabel
  ) {
    setError(null);
    setPendingId(decisionId);

    const response = await fetch(`/api/admin/support-decisions/${decisionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewLabel,
        reviewNotes: reviewDrafts[decisionId] ?? ''
      })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(data?.error ?? 'Could not save decision review');
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

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <SummaryStat label="Latest decisions" value={String(diagnosticsSummary.total)} />
        <SummaryStat label="Needs review" value={String(diagnosticsSummary.needsReview)} />
        <SummaryStat label="Reviewed" value={String(reviewedDecisionCount)} />
        <SummaryStat label="Escalated later" value={String(diagnosticsSummary.escalatedLater)} />
      </div>

      <div className="mt-5 space-y-3">
        {tickets.length ? (
          tickets.map((ticket) => {
            const disabled = isPending && pendingId === ticket.id;
            const conversationMessages = ticket.conversation_id
              ? supportMessagesByConversationId[ticket.conversation_id] ?? []
              : [];
            const latestDecision = ticket.conversation_id
              ? latestSupportDecisionsByConversationId[ticket.conversation_id]
              : undefined;
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

                {conversationMessages.length ? (
                  <div className="mt-4 rounded-[18px] bg-[var(--color-surface-2)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                      Conversation
                    </p>
                    <div className="mt-3 space-y-2">
                      {conversationMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`rounded-2xl px-4 py-3 text-sm ${
                            message.role === 'user'
                              ? 'bg-white text-[var(--color-text-primary)]'
                              : 'bg-[var(--color-void)] text-white'
                          }`}
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-70">
                            {message.role === 'user' ? 'Owner' : message.agent_name === 'admin_support' ? 'Admin' : 'Support'}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap leading-6">
                            {message.content}
                          </p>
                        </div>
                      ))}
                    </div>

                    <form
                      onSubmit={(event) => submitReply(event, ticket)}
                      className="mt-3 space-y-2"
                    >
                      <textarea
                        value={replyDrafts[ticket.id] ?? ''}
                        onChange={(event) =>
                          setReplyDrafts((current) => ({
                            ...current,
                            [ticket.id]: event.target.value
                          }))
                        }
                        className="min-h-[96px] w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                        placeholder="Reply to the owner in this support conversation"
                        maxLength={4000}
                      />
                      <button
                        type="submit"
                        disabled={disabled || !(replyDrafts[ticket.id] ?? '').trim()}
                        className="rounded-xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        Send reply
                      </button>
                    </form>
                  </div>
                ) : null}

                {latestDecision ? (
                  <div className="mt-4 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                        Latest AI decision
                      </p>
                      <AdminBadge>{latestDecision.domain.replace('_expert', '')}</AdminBadge>
                      <AdminBadge>{latestDecision.decision_type.replace('_', ' ')}</AdminBadge>
                      <AdminBadge tone={latestDecision.escalated_later ? 'warning' : 'default'}>
                        {latestDecision.escalated_later ? 'Escalated later' : 'No later escalation'}
                      </AdminBadge>
                      {latestDecision.review_label ? (
                        <AdminBadge tone="success">
                          Reviewed: {latestDecision.review_label.replace('_', ' ')}
                        </AdminBadge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      Confidence {Math.round(latestDecision.confidence * 100)}%
                      {' • '}
                      Route {latestDecision.route.replace('_', ' ')}
                      {' • '}
                      {new Date(latestDecision.created_at).toLocaleString()}
                    </p>
                    <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-[var(--color-text-primary)]">
                      {latestDecision.support_message}
                    </p>
                    {latestDecision.assistant_reply ? (
                      <p className="mt-2 rounded-2xl bg-[var(--color-void)] px-4 py-3 text-sm text-white">
                        {latestDecision.assistant_reply}
                      </p>
                    ) : null}
                    {latestDecision.evidence_refs.length ? (
                      <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
                        Evidence: {latestDecision.evidence_refs.join(', ')}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {reviewLabelOptions.map((option) => (
                        <AdminAction
                          key={option.value}
                          disabled={isPending && pendingId === latestDecision.id}
                          label={option.label}
                          onClick={() => submitReview(latestDecision.id, option.value)}
                        />
                      ))}
                    </div>
                    <textarea
                      value={reviewDrafts[latestDecision.id] ?? latestDecision.review_notes ?? ''}
                      onChange={(event) =>
                        setReviewDrafts((current) => ({
                          ...current,
                          [latestDecision.id]: event.target.value
                        }))
                      }
                      className="mt-3 min-h-[84px] w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                      placeholder="Optional review notes for this AI decision"
                      maxLength={4000}
                    />
                  </div>
                ) : null}
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

const reviewLabelOptions: Array<{ value: SupportReviewLabel; label: string }> = [
  { value: 'correct', label: 'Mark correct' },
  { value: 'wrong_domain', label: 'Wrong domain' },
  { value: 'weak_knowledge', label: 'Weak knowledge' },
  { value: 'bad_escalation', label: 'Bad escalation' },
  { value: 'poor_wording', label: 'Poor wording' },
  { value: 'missing_rule', label: 'Missing rule' }
];

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

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-[var(--color-surface-2)] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}
