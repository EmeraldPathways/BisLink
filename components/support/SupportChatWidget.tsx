'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, X } from 'lucide-react';
import type {
  ActivationStatus,
  ConversationMessage,
  SupportTicketDraft
} from '@/lib/agents/types';

type ChatResponse = {
  reply: string;
  route: 'support' | 'technical_triage' | 'setup_completion' | 'human_escalation';
  requiresHuman: boolean;
  activationStatus?: ActivationStatus;
  ticketDraft?: SupportTicketDraft | null;
  suggestedActionHref?: string;
  conversationId?: string | null;
};

export function SupportChatWidget({
  initialActivationStatus,
  variant = 'embedded'
}: {
  initialActivationStatus: ActivationStatus;
  variant?: 'embedded' | 'floating';
}) {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: 'assistant',
      content:
        'Ask about setup, bookings, payments, products, reviews, or a bug. I will use your BisLink setup context when available.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(variant === 'embedded');

  const conversationHistory = useMemo(
    () => messages.filter((message) => message.role !== 'system'),
    [messages]
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const nextMessages = [...messages, { role: 'user' as const, content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationId,
          conversationHistory
        })
      });

      const data = (await response.json()) as ChatResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Support chat request failed');
      }

      setLastResponse(data);
      setConversationId(data.conversationId ?? conversationId);
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.reply }
      ]);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Support chat request failed'
      );
    } finally {
      setIsLoading(false);
    }
  }

  const activationStatus = lastResponse?.activationStatus ?? initialActivationStatus;

  const widgetBody = (
    <section className="rounded-[28px] border border-[var(--color-border)] bg-white p-5 shadow-[0_18px_48px_rgba(17,13,10,0.08)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            AI Support
          </p>
          <h2 className="mt-2 font-display text-3xl">Context-aware help</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Activation score: {activationStatus.activationScore}%. Next step:{' '}
            {activationStatus.nextBestAction}
          </p>
        </div>
        {variant === 'floating' ? (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)]"
            aria-label="Close support chat"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto rounded-[22px] bg-[var(--color-surface-2)] p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === 'user'
                ? 'ml-auto max-w-[85%] bg-[var(--color-void)] text-white'
                : 'max-w-[90%] bg-white text-[var(--color-text-primary)]'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading ? (
          <div className="max-w-[90%] rounded-2xl bg-white px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            Checking your BisLink setup context...
          </div>
        ) : null}
      </div>

      {lastResponse?.requiresHuman ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This issue needs human review. A support summary can be escalated internally.
        </div>
      ) : null}

      {lastResponse?.ticketDraft ? (
        <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          Ticket draft ready: {lastResponse.ticketDraft.title}
        </div>
      ) : null}

      {lastResponse?.suggestedActionHref ? (
        <div className="mt-4">
          <Link
            href={lastResponse.suggestedActionHref}
            className="inline-flex items-center rounded-xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white"
          >
            Go to suggested action
          </Link>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask why bookings are blocked, how to add a service, or describe a bug."
          className="min-h-[96px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm"
          maxLength={4000}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-xl bg-[var(--color-void)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? 'Checking...' : 'Ask BisLink AI'}
        </button>
      </form>
    </section>
  );

  if (variant === 'floating') {
    return (
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 md:bottom-6 md:right-6">
        {isOpen ? (
          <div className="pointer-events-auto w-[min(420px,calc(100vw-2rem))]">
            {widgetBody}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="pointer-events-auto inline-flex items-center gap-3 rounded-full bg-[var(--color-void)] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(17,13,10,0.24)]"
          aria-label={isOpen ? 'Hide support chat' : 'Open support chat'}
        >
          {isOpen ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
          {isOpen ? 'Hide AI support' : 'Ask BisLink AI'}
        </button>
      </div>
    );
  }

  return widgetBody;
}
