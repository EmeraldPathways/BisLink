import { buildSupportReply } from '@/lib/agents/specialists';
import type { SupportAgentInput, SupportAgentOutput } from '@/lib/agents/types';

export async function runSupportAgent(
  input: SupportAgentInput
): Promise<SupportAgentOutput> {
  const grounded = buildSupportReply(input);

  return {
    reply: grounded.reply,
    route: 'support',
    domain: input.domain,
    decisionType: input.decisionType,
    confidence: input.confidence,
    evidenceRefs: input.evidenceRefs,
    requiresHuman: false,
    needsFollowUp: grounded.needsFollowUp,
    followUpQuestion: grounded.followUpQuestion,
    suggestedActionHref: grounded.suggestedActionHref
  };
}
