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
  activationStatus
}: {
  message: string;
  context: UserSupportContext;
  activationStatus: ActivationStatus;
}): Promise<SetupCompletionOutput> {
  const fallbackReply = buildFallbackReply(context, activationStatus);

  try {
    const aiReply = await runAgentCompletion({
      systemPrompt: SETUP_COMPLETION_SYSTEM_PROMPT,
      userMessage: message,
      context: {
        context,
        activationStatus
      },
      model: process.env.OPENAI_SUPPORT_MODEL,
      responseFormat: 'text'
    });

    return {
      reply: aiReply?.trim() || fallbackReply,
      route: 'setup_completion',
      requiresHuman: false,
      suggestedActionHref: activationStatus.nextBestActionHref
    };
  } catch {
    return {
      reply: fallbackReply,
      route: 'setup_completion',
      requiresHuman: false,
      suggestedActionHref: activationStatus.nextBestActionHref
    };
  }
}
