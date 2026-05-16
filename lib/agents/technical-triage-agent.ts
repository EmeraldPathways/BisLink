import { TECHNICAL_TRIAGE_SYSTEM_PROMPT } from '@/lib/agents/prompts';
import { runAgentCompletion } from '@/lib/agents/openai-client';
import type {
  ActivationStatus,
  SupportTicketDraft,
  TechnicalTriageOutput,
  UserSupportContext
} from '@/lib/agents/types';

function inferSeverity(message: string, context: UserSupportContext) {
  const normalized = message.toLowerCase();

  if (
    /security|breach|hacked|data loss|lost data/.test(normalized) ||
    /payment.*all|all payments failing/.test(normalized)
  ) {
    return 'P0' as const;
  }

  if (
    /cannot access account|can't access account|cant access account|public page broken|checkout broken/.test(
      normalized
    ) ||
    (context.stripeConnected && /payment failed|checkout failed/.test(normalized))
  ) {
    return 'P1' as const;
  }

  if (/visual bug|typo|spacing|alignment|font|colour|color/.test(normalized)) {
    return 'P3' as const;
  }

  return 'P2' as const;
}

function inferArea(message: string) {
  const normalized = message.toLowerCase();
  if (/payment|checkout|stripe/.test(normalized)) return 'payments';
  if (/booking|availability|calendar/.test(normalized)) return 'bookings';
  if (/link|public page|page/.test(normalized)) return 'public_page';
  if (/dashboard|login|account/.test(normalized)) return 'dashboard';
  return 'general';
}

function needsFollowUp(message: string) {
  const normalized = message.toLowerCase();
  const hasAction = /click|open|submit|save|pay|book|load/.test(normalized);
  const hasFailure = /error|broken|fail|not work|blank|stuck|crash/.test(normalized);
  return !(hasAction && hasFailure);
}

function buildTicketDraft(
  message: string,
  context: UserSupportContext,
  activationStatus: ActivationStatus
): SupportTicketDraft {
  const severity = inferSeverity(message, context);

  return {
    title: `Support issue: ${message.slice(0, 72)}`,
    severity,
    affectedArea: inferArea(message),
    userId: context.userId,
    userEmail: context.email ?? null,
    bislinkUrl: context.publicUrl ?? null,
    stepsToReproduce: message,
    expectedResult: 'The user should be able to complete the intended BisLink action without errors.',
    actualResult: message,
    evidence: null as unknown as string | undefined,
    suggestedPriority:
      severity === 'P0' || severity === 'P1' ? 'high' : 'normal',
    developerNotes: `Activation score: ${activationStatus.activationScore}. Services: ${
      context.serviceCount ?? 0
    }. Availability: ${context.hasAvailability ? 'yes' : 'no'}. Stripe connected: ${
      context.stripeConnected ? 'yes' : 'no'
    }. Page published: ${context.pagePublished ? 'yes' : 'no'}.`
  };
}

export async function runTechnicalTriageAgent({
  message,
  context,
  activationStatus
}: {
  message: string;
  context: UserSupportContext;
  activationStatus: ActivationStatus;
}): Promise<TechnicalTriageOutput> {
  if (needsFollowUp(message)) {
    return {
      reply:
        'I can draft a technical ticket for this. What exactly were you trying to do, and what happened instead?',
      route: 'technical_triage',
      requiresHuman: false,
      needsFollowUp: true,
      followUpQuestion:
        'What exactly were you trying to do, and what happened instead?'
    };
  }

  const fallbackDraft = buildTicketDraft(message, context, activationStatus);

  try {
    const aiReply = await runAgentCompletion({
      systemPrompt: TECHNICAL_TRIAGE_SYSTEM_PROMPT,
      userMessage: message,
      context: {
        context,
        activationStatus,
        draft: fallbackDraft
      },
      model: process.env.OPENAI_SUPPORT_MODEL,
      responseFormat: 'text'
    });

    return {
      reply:
        aiReply?.trim() ||
        'I drafted a technical support ticket with your account context for review.',
      route: 'technical_triage',
      requiresHuman: fallbackDraft.severity === 'P0' || fallbackDraft.severity === 'P1',
      needsFollowUp: false,
      ticketDraft: fallbackDraft
    };
  } catch {
    return {
      reply:
        'I drafted a technical support ticket with your account context for review.',
      route: 'technical_triage',
      requiresHuman: fallbackDraft.severity === 'P0' || fallbackDraft.severity === 'P1',
      needsFollowUp: false,
      ticketDraft: fallbackDraft
    };
  }
}
