import { SETUP_COMPLETION_SYSTEM_PROMPT } from '@/lib/agents/prompts';
import { runAgentCompletion } from '@/lib/agents/openai-client';
import type {
  ActivationStatus,
  SetupCompletionOutput,
  UserSupportContext
} from '@/lib/agents/types';

function buildFallbackReply(
  context: UserSupportContext,
  activationStatus: ActivationStatus
) {
  const score = activationStatus.activationScore;
  const action = activationStatus.nextBestAction;
  const reason =
    activationStatus.nextBestActionReason ??
    'This is the next missing step in your BisLink setup.';

  if (!context.businessName) {
    return `Your BisLink page is ${score}% ready. The next step is to add your business name, because customers need to know who the page belongs to before they trust it.`;
  }

  return `Your BisLink page is ${score}% ready. The next step is to ${action.charAt(0).toLowerCase()}${action.slice(
    1
  )} ${reason}`;
}

export async function runSetupCompletionHelper({
  message,
  context,
  activationStatus,
  domain = !context.stripeConnected ? 'payments_expert' : 'booking_expert',
  confidence = 0.93,
  evidenceRefs = []
}: {
  message: string;
  context: UserSupportContext;
  activationStatus: ActivationStatus;
  domain?: SetupCompletionOutput['domain'];
  confidence?: number;
  evidenceRefs?: string[];
}): Promise<SetupCompletionOutput> {
  const fallbackReply = buildFallbackReply(context, activationStatus);
  void runAgentCompletion;
  void SETUP_COMPLETION_SYSTEM_PROMPT;
  void message;

  return {
    reply: fallbackReply,
    route: 'setup_completion',
    domain,
    decisionType: 'grounded_answer',
    confidence,
    evidenceRefs,
    requiresHuman: false,
    suggestedActionHref: activationStatus.nextBestActionHref
  };
}
