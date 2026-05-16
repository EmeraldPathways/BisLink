import { calculateActivationScore } from '@/lib/agents/activation/activation-score';
import { getNextBestAction } from '@/lib/agents/activation/next-best-action';
import type { ActivationStatus, UserSupportContext } from '@/lib/agents/types';

export async function getActivationStatus(
  context: UserSupportContext
): Promise<ActivationStatus> {
  const { activationScore, completedSteps, missingSteps } =
    calculateActivationScore(context);
  const nextBestAction = getNextBestAction(missingSteps, context);

  return {
    activationScore,
    completedSteps,
    missingSteps,
    ...nextBestAction
  };
}
