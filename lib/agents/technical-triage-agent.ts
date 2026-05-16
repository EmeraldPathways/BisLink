import {
  detectEscalation,
  getEscalationFollowUpQuestion
} from '@/lib/agents/escalation';
import { TECHNICAL_TRIAGE_SYSTEM_PROMPT } from '@/lib/agents/prompts';
import { runAgentCompletion } from '@/lib/agents/openai-client';
import type {
  ActivationStatus,
  SupportTicketDraft,
  TechnicalTriageOutput,
  UserSupportContext
} from '@/lib/agents/types';

type TechnicalIssueType =
  | 'payments'
  | 'bookings'
  | 'public_page'
  | 'dashboard'
  | 'account_access'
  | 'data_loss'
  | 'security'
  | 'visual'
  | 'general';

function inferIssueType(message: string): TechnicalIssueType {
  const normalized = message.toLowerCase();
  if (/security|breach|hacked|compromised|unauthori[sz]ed/.test(normalized)) return 'security';
  if (/data loss|lost data|missing|disappeared|deleted/.test(normalized)) return 'data_loss';
  if (/cannot access account|can'?t access account|cant access account|log in|login|locked out/.test(normalized)) {
    return 'account_access';
  }
  if (/payment|checkout|stripe|charged|charge/.test(normalized)) return 'payments';
  if (/booking|availability|calendar|slot/.test(normalized)) return 'bookings';
  if (/public page|link page|my link|page not loading|page broken/.test(normalized)) return 'public_page';
  if (/dashboard|save|editor|settings|owner/.test(normalized)) return 'dashboard';
  if (/visual bug|typo|spacing|alignment|font|colour|color|layout/.test(normalized)) return 'visual';
  return 'general';
}

function inferSeverity(message: string, context: UserSupportContext, issueType: TechnicalIssueType) {
  const normalized = message.toLowerCase();
  const escalation = detectEscalation(message, context);

  if (
    issueType === 'security' ||
    issueType === 'data_loss' ||
    /\bapp down\b|\beverything is down\b|\ball payments failing\b|\bpayments failing for everyone\b/.test(normalized)
  ) {
    return 'P0' as const;
  }

  if (escalation?.issueType === 'account_access' || issueType === 'account_access') {
    return 'P1' as const;
  }

  if (
    /\bpublic page broken\b|\bcheckout broken\b|\bbooking failed\b|\bpayment failed\b|\bcheckout failed\b/.test(normalized) ||
    (context.stripeConnected && issueType === 'payments')
  ) {
    return 'P1' as const;
  }

  if (issueType === 'visual') {
    return 'P3' as const;
  }

  return 'P2' as const;
}

function inferArea(issueType: TechnicalIssueType) {
  switch (issueType) {
    case 'payments':
      return 'payments';
    case 'bookings':
      return 'bookings';
    case 'public_page':
      return 'public_page';
    case 'dashboard':
      return 'dashboard';
    case 'account_access':
      return 'account_access';
    case 'data_loss':
      return 'data_integrity';
    case 'security':
      return 'security';
    case 'visual':
      return 'ui';
    default:
      return 'general';
  }
}

function hasAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function getTechnicalFollowUp(message: string, issueType: TechnicalIssueType): string {
  const normalized = message.toLowerCase();

  switch (issueType) {
    case 'payments':
      return 'What were you trying to charge for, and what error or result did you see?';
    case 'bookings':
      if (/calendar|google calendar|sync|reconnect/.test(normalized)) {
        return 'What happened when you tried to connect or reconnect Google Calendar, and what status or error did you see?';
      }
      return 'What were you trying to book, and what happened instead?';
    case 'public_page':
      return 'Which public page or section is broken, and what do you see when it fails?';
    case 'dashboard':
      return 'Which dashboard page or save action failed, and what happened instead?';
    case 'visual':
      return 'Which page has the UI issue, and what looks wrong?';
    case 'account_access':
      return 'What happens when you try to log in or access the account?';
    case 'data_loss':
      return 'What data is missing, and where did you expect to see it?';
    case 'security':
      return 'What suspicious behavior did you notice, and where did it happen?';
    default:
      return 'What exactly were you trying to do, and what happened instead?';
  }
}

function needsFollowUp(message: string, issueType: TechnicalIssueType) {
  const normalized = message.toLowerCase();
  const hasAction = hasAny(normalized, [
    /\bclick\b/,
    /\bopen\b/,
    /\bsubmit\b/,
    /\bsav(?:e|ing)\b/,
    /\bpay\b/,
    /\bbook\b/,
    /\bload\b/,
    /\blog in\b/,
    /\bcheckout\b/
  ]);
  const hasFailure = hasAny(normalized, [
    /\berror\b/,
    /\bbroken\b/,
    /\bfail/,
    /\bnot work/,
    /\bblank\b/,
    /\bstuck\b/,
    /\bcrash/,
    /\bmissing\b/,
    /\bdisappear/
  ]);
  const hasLocation = hasAny(normalized, [
    /\bdashboard\b/,
    /\bproducts?\b/,
    /\bservices?\b/,
    /\bpayouts?\b/,
    /\bavailability\b/,
    /\blink\b/,
    /\bpublic page\b/,
    /\bcheckout\b/,
    /\bbookings?\b/
  ]);

  if (issueType === 'visual') {
    return !hasLocation;
  }

  return !(hasAction && hasFailure && hasLocation);
}

function buildTicketDraft(
  message: string,
  context: UserSupportContext,
  activationStatus: ActivationStatus,
  issueType: TechnicalIssueType
): SupportTicketDraft {
  const severity = inferSeverity(message, context, issueType);

  return {
    title: `Support issue: ${message.slice(0, 72)}`,
    severity,
    affectedArea: inferArea(issueType),
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
    }. Page published: ${context.pagePublished ? 'yes' : 'no'}. Issue type: ${issueType}.`
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
  const escalation = detectEscalation(message, context);
  const issueType = inferIssueType(message);

  if (escalation && needsFollowUp(message, issueType)) {
    const followUpQuestion = getEscalationFollowUpQuestion(escalation.issueType);
    return {
      reply: followUpQuestion,
      route: 'technical_triage',
      requiresHuman: true,
      needsFollowUp: true,
      followUpQuestion
    };
  }

  if (needsFollowUp(message, issueType)) {
    const followUpQuestion = getTechnicalFollowUp(message, issueType);
    return {
      reply: followUpQuestion,
      route: 'technical_triage',
      requiresHuman: false,
      needsFollowUp: true,
      followUpQuestion
    };
  }

  const fallbackDraft = buildTicketDraft(message, context, activationStatus, issueType);

  try {
    const aiReply = await runAgentCompletion({
      systemPrompt: TECHNICAL_TRIAGE_SYSTEM_PROMPT,
      userMessage: message,
      context: {
        context,
        activationStatus,
        draft: fallbackDraft,
        issueType
      },
      model: process.env.OPENAI_SUPPORT_MODEL,
      responseFormat: 'text'
    });

    return {
      reply:
        aiReply?.trim() ||
        'I drafted a technical support ticket with your account context for review.',
      route: 'technical_triage',
      requiresHuman:
        fallbackDraft.severity === 'P0' ||
        fallbackDraft.severity === 'P1' ||
        escalation !== null,
      needsFollowUp: false,
      ticketDraft: fallbackDraft
    };
  } catch {
    return {
      reply:
        'I drafted a technical support ticket with your account context for review.',
      route: 'technical_triage',
      requiresHuman:
        fallbackDraft.severity === 'P0' ||
        fallbackDraft.severity === 'P1' ||
        escalation !== null,
      needsFollowUp: false,
      ticketDraft: fallbackDraft
    };
  }
}
