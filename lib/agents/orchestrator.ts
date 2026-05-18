import { detectEscalation } from '@/lib/agents/escalation';
import { scoreBusinessAreaKnowledge } from '@/lib/agents/knowledge/registry';
import type {
  ActivationStatus,
  RouterResult,
  SupportDecisionType,
  SupportDomain,
  UserSupportContext
} from '@/lib/agents/types';

function includesAny(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

function buildDecision(
  partial: Pick<
    RouterResult,
    | 'route'
    | 'domain'
    | 'decisionType'
    | 'confidence'
    | 'reason'
    | 'requiresHuman'
    | 'evidenceRefs'
    | 'knowledgeAreaIds'
  > &
    Partial<Pick<RouterResult, 'suggestedActionHref'>>
): RouterResult {
  return {
    ...partial,
    suggestedActionHref: partial.suggestedActionHref
  };
}

function inferSetupDomain(context: UserSupportContext): SupportDomain {
  if (!context.stripeConnected) return 'payments_expert';
  if (!context.hasAvailability) return 'booking_expert';
  return 'frontend_expert';
}

function inferTechnicalDomain(topDomain: SupportDomain | null): SupportDomain {
  return topDomain ?? 'backend_expert';
}

export function classifySupportRequest({
  message,
  context,
  activationStatus
}: {
  message: string;
  context: UserSupportContext;
  activationStatus: ActivationStatus;
}): RouterResult {
  const normalized = message.toLowerCase();
  const escalation = detectEscalation(message, context);
  const knowledgeMatches = scoreBusinessAreaKnowledge(message);
  const topMatch = knowledgeMatches[0] ?? null;
  const domain = topMatch?.area.domain ?? 'frontend_expert';
  const evidenceRefs = topMatch
    ? [
        ...topMatch.evidenceRefs,
        ...topMatch.area.curatedDocIds.map((id) => `doc:${id}`)
      ]
    : [];
  const knowledgeAreaIds = topMatch ? [topMatch.area.id] : [];

  if (escalation) {
    return buildDecision({
      route: 'human_escalation',
      domain: 'safety_escalation_expert',
      decisionType: 'human_escalation',
      confidence: 0.99,
      reason: escalation.reason,
      requiresHuman: true,
      evidenceRefs,
      knowledgeAreaIds
    });
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
    return buildDecision({
      route: 'setup_completion',
      domain: 'payments_expert',
      decisionType: 'grounded_answer',
      confidence: 0.96,
      reason: 'Message matches an incomplete Stripe setup blocker.',
      requiresHuman: false,
      evidenceRefs: ['registry:payouts-and-stripe', 'doc:payouts-stripe'],
      knowledgeAreaIds: ['payouts-and-stripe'],
      suggestedActionHref: '/payouts'
    });
  }

  const setupQuestion =
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
      (!context.hasAvailability && includesAny(normalized, ['book', 'booking'])) ||
      (!context.stripeConnected && includesAny(normalized, ['payment', 'pay', 'stripe'])));

  if (setupQuestion) {
    const setupDomain = inferSetupDomain(context);
    const suggestedActionHref =
      setupDomain === 'payments_expert'
        ? '/payouts'
        : setupDomain === 'booking_expert'
          ? '/availability'
          : activationStatus.nextBestActionHref;

    return buildDecision({
      route: 'setup_completion',
      domain: setupDomain,
      decisionType: 'grounded_answer',
      confidence: 0.93,
      reason: 'Activation blockers match the user question.',
      requiresHuman: false,
      evidenceRefs:
        setupDomain === 'payments_expert'
          ? ['registry:payouts-and-stripe', 'doc:payouts-stripe']
          : ['registry:availability-and-blocked-time', 'doc:availability'],
      knowledgeAreaIds:
        setupDomain === 'payments_expert'
          ? ['payouts-and-stripe']
          : ['availability-and-blocked-time'],
      suggestedActionHref
    });
  }

  if (
    includesAny(normalized, ['google calendar', 'calendar connection', 'calendar sync']) &&
    includesAny(normalized, [
      'stopped working',
      'not syncing',
      'stopped syncing',
      'sync failed',
      'not appearing there'
    ])
  ) {
    return buildDecision({
      route: 'technical_triage',
      domain: 'calendar_expert',
      decisionType: 'technical_triage',
      confidence: 0.96,
      reason: 'Message describes a calendar integration or sync failure.',
      requiresHuman: false,
      evidenceRefs: ['registry:calendar-google', 'doc:google-calendar-connection'],
      knowledgeAreaIds: ['calendar-google'],
      suggestedActionHref: '/calendar'
    });
  }

  const technicalSignals =
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
      'visual bug',
      'typo',
      'still shows',
      'still not appearing',
      'still does not appear',
      'never showed up',
      'never appeared',
      'cannot see',
      'not receiving',
      'can still book'
    ]) ||
    /(?:saved|connected|paid).*(?:but|still).*(?:not|old|missing|cannot)/.test(normalized);

  if (technicalSignals) {
    return buildDecision({
      route: 'technical_triage',
      domain: inferTechnicalDomain(topMatch?.area.domain ?? null),
      decisionType: 'technical_triage',
      confidence: topMatch ? 0.94 : 0.82,
      reason: topMatch
        ? `Message matches a state discrepancy or technical failure in ${topMatch.area.title}.`
        : 'Message describes a defect, failure, or broken experience.',
      requiresHuman: false,
      evidenceRefs,
      knowledgeAreaIds,
      suggestedActionHref: topMatch?.area.suggestedActionHref
    });
  }

  if (!topMatch || topMatch.score < 4) {
    return buildDecision({
      route: 'support',
      domain: domain,
      decisionType: 'clarifying_question',
      confidence: topMatch ? 0.45 : 0.3,
      reason: 'Not enough grounded evidence to answer directly.',
      requiresHuman: false,
      evidenceRefs,
      knowledgeAreaIds,
      suggestedActionHref: topMatch?.area.suggestedActionHref
    });
  }

  return buildDecision({
    route: 'support',
    domain,
    decisionType: 'grounded_answer',
    confidence: Math.min(0.98, 0.65 + topMatch.score / 20),
    reason: `Message is grounded in ${topMatch.area.title}.`,
    requiresHuman: false,
    evidenceRefs,
    knowledgeAreaIds,
    suggestedActionHref: topMatch.area.suggestedActionHref
  });
}
