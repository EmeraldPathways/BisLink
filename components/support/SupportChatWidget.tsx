'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import { formatSupportError } from '@/lib/agents/format-support-error';
import type { ActivationStatus, ConversationMessage } from '@/lib/agents/types';

type ChatResponse = {
  reply: string;
  route: 'support' | 'technical_triage' | 'setup_completion' | 'human_escalation';
  requiresHuman: boolean;
  activationStatus?: ActivationStatus;
  suggestedActionHref?: string;
  conversationId?: string | null;
};

type ChatBootstrapResponse = {
  conversationId?: string | null;
  messages?: ConversationMessage[];
  activationStatus?: ActivationStatus;
};

export function SupportChatWidget({
  initialActivationStatus,
  variant = 'floating'
}: {
  initialActivationStatus: ActivationStatus;
  variant?: 'embedded' | 'floating';
}) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
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

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function loadConversation() {
      try {
        const search = conversationId
          ? `?conversationId=${encodeURIComponent(conversationId)}`
          : '';
        const response = await fetch(`/api/support-chat${search}`, {
          method: 'GET',
          cache: 'no-store'
        });
        const data = (await response.json()) as ChatBootstrapResponse & { error?: string };

        if (!response.ok) {
          throw new Error(formatSupportError(data.error));
        }

        if (cancelled) return;

        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
        if (data.activationStatus) {
          setLastResponse((current) => ({
            reply: current?.reply ?? '',
            route: current?.route ?? 'support',
            requiresHuman: current?.requiresHuman ?? false,
            suggestedActionHref: current?.suggestedActionHref,
            conversationId: data.conversationId ?? current?.conversationId ?? null,
            activationStatus: data.activationStatus
          }));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(formatSupportError(loadError));
        }
      }
    }

    void loadConversation();

    return () => {
      cancelled = true;
    };
  }, [conversationId, isOpen]);

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
      const payload: {
        message: string;
        conversationHistory: ConversationMessage[];
        conversationId?: string;
      } = {
        message: trimmed,
        conversationHistory
      };

      if (conversationId) {
        payload.conversationId = conversationId;
      }

      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as ChatResponse & { error?: string };
      if (!response.ok) {
        throw new Error(formatSupportError(data.error));
      }

      setLastResponse(data);
      setConversationId(data.conversationId ?? conversationId);
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.reply }
      ]);
    } catch (submissionError) {
      setError(formatSupportError(submissionError));
    } finally {
      setIsLoading(false);
    }
  }

  const widgetBody = (
    <section className="rounded-[24px] border border-[var(--color-border)] bg-white p-3 shadow-[0_20px_60px_rgba(17,13,10,0.14)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-2 pb-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Support</p>
        </div>
        {variant === 'floating' ? (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-2)]"
            aria-label="Close support chat"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto px-1">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === 'user'
                ? 'ml-auto max-w-[85%] bg-[var(--color-void)] text-white'
                : 'mr-auto max-w-[90%] bg-[var(--color-surface-2)] text-[var(--color-text-primary)]'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading ? (
          <div className="mr-auto inline-flex items-center gap-2 rounded-2xl bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking...
          </div>
        ) : null}
      </div>

      {!lastResponse?.requiresHuman && lastResponse?.suggestedActionHref ? (
        <div className="mt-3">
          <Link
            href={lastResponse.suggestedActionHref}
            className="inline-flex items-center rounded-xl bg-[var(--color-surface-2)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)]"
          >
            Open suggested page
          </Link>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about bookings, payments, products, or bugs."
            className="min-h-[88px] flex-1 resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm"
            maxLength={4000}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-void)] text-white disabled:opacity-60"
            aria-label={isLoading ? 'Sending support request' : 'Send support request'}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </section>
  );

  if (variant === 'floating') {
    return (
      <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+6rem)] right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 md:bottom-6 md:right-6">
        {isOpen ? (
          <div className="pointer-events-auto w-[min(380px,calc(100vw-2rem))]">
            {widgetBody}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-void)] text-white shadow-[0_18px_48px_rgba(17,13,10,0.24)]"
          aria-label={isOpen ? 'Hide support chat' : 'Open support chat'}
        >
          {isOpen ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        </button>
      </div>
    );
  }

  return widgetBody;
}
