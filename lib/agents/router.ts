import { detectEscalation } from '@/lib/agents/escalation';
import { runAgentCompletion } from '@/lib/agents/openai-client';
import { ROUTER_SYSTEM_PROMPT } from '@/lib/agents/prompts';
import type {
  ActivationStatus,
  ConversationMessage,
  RouterResult,
  UserSupportContext
} from '@/lib/agents/types';

function includesAny(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

function parseRouterFallback(raw: string | null): RouterResult | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<RouterResult>;
    if (
      (parsed.route === 'support' ||
        parsed.route === 'technical_triage' ||
        parsed.route === 'setup_completion' ||
        parsed.route === 'human_escalation') &&
      typeof parsed.confidence === 'number' &&
      typeof parsed.reason === 'string' &&
      typeof parsed.requiresHuman === 'boolean'
    ) {
      return {
        route: parsed.route,
        confidence: parsed.confidence,
        reason: parsed.reason,
        requiresHuman: parsed.requiresHuman
      };
    }
  } catch {
    return null;
  }

  return null;
}

export async function routeSupportMessage({
  message,
  context,
  activationStatus,
  conversationHistory,
  currentRoute,
  runCompletion = runAgentCompletion
}: {
  message: string;
  context: UserSupportContext;
  activationStatus: ActivationStatus;
  conversationHistory?: ConversationMessage[];
  currentRoute?: RouterResult['route'] | 'admin_support';
  runCompletion?: typeof runAgentCompletion;
}): Promise<RouterResult> {
  const normalized = message.toLowerCase();
  const escalation = detectEscalation(message, context);

  if (escalation) {
    return {
      route: 'human_escalation',
      confidence: 0.99,
      reason: escalation.reason,
      requiresHuman: true
    };
  }

  if (
    currentRoute === 'human_escalation' &&
    conversationHistory?.some(
      (item) =>
        item.role === 'assistant' &&
        /needs human review|support team/i.test(item.content)
    )
  ) {
    return {
      route: 'human_escalation',
      confidence: 0.91,
      reason: 'Continuing an active human-escalation follow-up.',
      requiresHuman: true
    };
  }

  if (
    !context.stripeConnected &&
    includesAny(normalized, [
      'business payments not configured',
      'connect stripe',
      'stripe setup',
      'complete stripe setup'
    ])
  ) {
    return {
      route: 'setup_completion',
      confidence: 0.96,
      reason: 'Message matches an incomplete Stripe setup blocker.',
      requiresHuman: false
    };
  }

  if (
    includesAny(normalized, ['request review']) &&
    includesAny(normalized, ['button', 'click', 'nothing happens'])
  ) {
    return {
      route: 'support',
      confidence: 0.95,
      reason: 'Message matches a documented review-request limitation.',
      requiresHuman: false
    };
  }

  if (
    includesAny(normalized, [
      'bug',
      'broken',
      'error',
      'not loading',
      'doesn’t work',
      'doesnt work',
      'checkout',
      'payment failed',
      'page crashed',
      'booking failed',
      'keeps failing',
      'nothing happens',
      'visual bug',
      'typo'
    ])
  ) {
    return {
      route: 'technical_triage',
      confidence: 0.94,
      reason: 'Message describes a defect, failure, or broken experience.',
      requiresHuman: false
    };
  }

  if (
    includesAny(normalized, ['google calendar', 'calendar connection', 'calendar sync']) &&
    includesAny(normalized, [
      'stopped working',
      'not syncing',
      'stopped syncing',
      'reconnect',
      'sync failed'
    ])
  ) {
    return {
      route: 'technical_triage',
      confidence: 0.95,
      reason: 'Message describes a calendar integration or sync failure.',
      requiresHuman: false
    };
  }

  if (
    includesAny(normalized, ['public page', 'link page', 'hero image', 'cover image', 'live page', 'content']) &&
    includesAny(normalized, [
      'not showing',
      'not visible',
      'still shows',
      'old content',
      'saved successfully'
    ])
  ) {
    return {
      route: 'technical_triage',
      confidence: 0.94,
      reason: 'Message describes saved content not appearing on the public page.',
      requiresHuman: false
    };
  }

  if (
    includesAny(normalized, ['upload', 'image upload', 'portfolio image']) &&
    includesAny(normalized, ['failing', 'failed', 'not working', 'error'])
  ) {
    return {
      route: 'technical_triage',
      confidence: 0.94,
      reason: 'Message describes a media upload failure.',
      requiresHuman: false
    };
  }

  if (
    includesAny(normalized, ['support inbox', 'conversation messages', 'support messages']) &&
    includesAny(normalized, ['missing', 'gone', 'disappeared'])
  ) {
    return {
      route: 'technical_triage',
      confidence: 0.95,
      reason: 'Message describes missing support conversation data.',
      requiresHuman: false
    };
  }

  if (
    includesAny(normalized, [
      'support inbox',
      'conversation',
      'support ticket',
      'support request',
      'contact-form message',
      'contact form message'
    ]) &&
    includesAny(normalized, [
      'never appeared',
      'never showed up',
      'cannot see',
      'can not see',
      'not see',
      'no ticket appears',
      'sent, but no ticket appears'
    ])
  ) {
    return {
      route: 'technical_triage',
      confidence: 0.95,
      reason: 'Message describes missing or invisible support conversation data.',
      requiresHuman: false
    };
  }

  if (
    includesAny(normalized, ['blocked time']) &&
    includesAny(normalized, ['can still book', 'still book', 'still shows', 'still available'])
  ) {
    return {
      route: 'technical_triage',
      confidence: 0.95,
      reason: 'Message describes blocked time not affecting availability correctly.',
      requiresHuman: false
    };
  }

  if (
    includesAny(normalized, ['google calendar', 'calendar']) &&
    includesAny(normalized, ['says connected', 'still not appearing', 'not appearing there'])
  ) {
    return {
      route: 'technical_triage',
      confidence: 0.95,
      reason: 'Message describes bookings not syncing despite a connected calendar.',
      requiresHuman: false
    };
  }

  if (
    includesAny(normalized, ['review']) &&
    includesAny(normalized, ['clicked publish', 'still does not appear', 'still does not show'])
  ) {
    return {
      route: 'technical_triage',
      confidence: 0.94,
      reason: 'Message describes published review content not appearing on the public page.',
      requiresHuman: false
    };
  }

  if (
    includesAny(normalized, ['order confirmation', 'order confirmations']) &&
    includesAny(normalized, ['not receiving', 'not received', 'not getting'])
  ) {
    return {
      route: 'technical_triage',
      confidence: 0.95,
      reason: 'Message describes order confirmations not being delivered.',
      requiresHuman: false
    };
  }

  if (
    activationStatus.missingSteps.length > 0 &&
    (includesAny(normalized, [
      'what next',
      'why nobody can book',
      'why can’t customers book',
      'why cant customers book',
      'why can’t people pay',
      'why cant people pay',
      'setup',
      'complete setup',
      'not getting bookings'
    ]) ||
      (!context.hasAvailability &&
        includesAny(normalized, ['book', 'booking'])) ||
      (!context.stripeConnected &&
        includesAny(normalized, ['payment', 'pay', 'stripe'])))
  ) {
    return {
      route: 'setup_completion',
      confidence: 0.9,
      reason: 'Activation blockers match the user question.',
      requiresHuman: false
    };
  }

  const aiFallback = parseRouterFallback(
    await runCompletion({
      systemPrompt: ROUTER_SYSTEM_PROMPT,
      userMessage: message,
      context: {
        context,
        activationStatus,
        conversationHistory
      },
      model: process.env.OPENAI_SUPPORT_MODEL,
      responseFormat: 'json'
    }).catch(() => null)
  );

  if (aiFallback) {
    return aiFallback;
  }

  if (conversationHistory?.some((item) => item.role === 'assistant')) {
    return {
      route: 'support',
      confidence: 0.72,
      reason: 'Defaulting to support within an active conversation.',
      requiresHuman: false
    };
  }

  return {
    route: 'support',
    confidence: 0.84,
    reason: 'Default route for how-to and product usage questions.',
    requiresHuman: false
  };
}
