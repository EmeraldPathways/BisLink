import { classifySupportRequest } from '@/lib/agents/orchestrator';
import { runAgentCompletion } from '@/lib/agents/openai-client';
import type {
  ActivationStatus,
  ConversationMessage,
  RouterResult,
  UserSupportContext
} from '@/lib/agents/types';

function buildSupportFollowUpMessage({
  message,
  conversationHistory
}: {
  message: string;
  conversationHistory?: ConversationMessage[];
}) {
  const previousUserMessage = [...(conversationHistory ?? [])]
    .reverse()
    .find((item) => item.role === 'user')?.content;

  if (!previousUserMessage) {
    return message;
  }

  return `${previousUserMessage}\n${message}`;
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
      domain: 'safety_escalation_expert',
      decisionType: 'human_escalation',
      confidence: 0.91,
      reason: 'Continuing an active human-escalation follow-up.',
      requiresHuman: true,
      evidenceRefs: [],
      knowledgeAreaIds: []
    };
  }

  void runCompletion;

  return classifySupportRequest({
    message:
      currentRoute === 'support'
        ? buildSupportFollowUpMessage({
            message,
            conversationHistory
          })
        : message,
    context,
    activationStatus
  });
}
