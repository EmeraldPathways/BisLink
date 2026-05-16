import { SUPPORT_AGENT_SYSTEM_PROMPT } from '@/lib/agents/prompts';
import { runAgentCompletion } from '@/lib/agents/openai-client';
import { shouldEscalate } from '@/lib/agents/escalation';
import type { SupportAgentInput, SupportAgentOutput } from '@/lib/agents/types';

function buildDeterministicReply(input: SupportAgentInput) {
  const docText = input.relevantDocs[0]?.content;

  if (!input.context.hasAvailability && /book/i.test(input.message)) {
    return {
      reply:
        'Your services may be set up, but customers cannot book yet because no availability has been added. Go to Dashboard -> Availability and add your available times.',
      suggestedActionHref: '/availability'
    };
  }

  if (!input.context.stripeConnected && /payment|stripe|checkout|pay/i.test(input.message)) {
    return {
      reply:
        'Payments are not fully ready because Stripe is not connected yet. Go to Dashboard -> Payouts and complete Stripe setup before customers try to pay online.',
      suggestedActionHref: '/payouts'
    };
  }

  if (docText) {
    return {
      reply: docText,
      suggestedActionHref: input.activationStatus.nextBestActionHref
    };
  }

  return {
    reply:
      'I can help with BisLink setup, bookings, products, reviews, payments, and public page issues. Tell me what you are trying to do, and I will guide you step by step.',
    suggestedActionHref: input.activationStatus.nextBestActionHref
  };
}

export async function runSupportAgent(
  input: SupportAgentInput
): Promise<SupportAgentOutput> {
  const requiresHuman = shouldEscalate(input.message, input.context);
  if (requiresHuman) {
    return {
      reply:
        'This issue needs human review. I can summarize it and prepare it for the support team now.',
      route: 'support',
      requiresHuman: true
    };
  }

  const fallback = buildDeterministicReply(input);

  try {
    const aiReply = await runAgentCompletion({
      systemPrompt: SUPPORT_AGENT_SYSTEM_PROMPT,
      userMessage: input.message,
      context: input,
      model: process.env.OPENAI_SUPPORT_MODEL,
      responseFormat: 'text'
    });

    return {
      reply: aiReply?.trim() || fallback.reply,
      route: 'support',
      requiresHuman: false,
      suggestedActionHref: fallback.suggestedActionHref
    };
  } catch {
    return {
      reply: fallback.reply,
      route: 'support',
      requiresHuman: false,
      suggestedActionHref: fallback.suggestedActionHref
    };
  }
}
