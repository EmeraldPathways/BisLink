import { z } from 'zod';
import { callWithCache, MODELS, parseAgentJSON } from '../lib/anthropic';
import { SYSTEM_PROMPT } from '../prompts/managerAgent';
import type { ManagerAgentContext, ManagerAgentOutput } from '../types';

const schema = z.object({
  overallStatus: z.union([z.literal('healthy'), z.literal('degraded'), z.literal('down')]),
  summary: z.string(),
  criticalIssues: z.array(z.string()),
  recommendations: z.array(z.string())
});

export async function runManagerAgent(context: ManagerAgentContext): Promise<ManagerAgentOutput> {
  const fallback = fallbackOutput(context);

  try {
    const response = await callWithCache({
      model: MODELS.HAIKU,
      systemPrompt: SYSTEM_PROMPT,
      userMessage: JSON.stringify(context.diagnostics, null, 2),
      maxTokens: 450,
      cacheTTL: '5min'
    });

    return schema.parse(parseAgentJSON<ManagerAgentOutput>(response));
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

function fallbackOutput(context: ManagerAgentContext): ManagerAgentOutput {
  const failures = context.diagnostics.checks.filter((check) => check.level === 'fail');
  const warnings = context.diagnostics.checks.filter((check) => check.level === 'warn');

  return {
    overallStatus: context.diagnostics.overallStatus,
    summary:
      failures.length > 0
        ? `${failures.length} critical check(s) failed across the agent fleet.`
        : warnings.length > 0
          ? `${warnings.length} check(s) need attention, but the fleet is still partially operational.`
          : 'All health checks passed for the current diagnostics run.',
    criticalIssues: failures.map((check) => `${check.name}: ${check.summary}`),
    recommendations: buildRecommendations(failures, warnings)
  };
}

function buildRecommendations(failures: Array<{ name: string; summary: string }>, warnings: Array<{ name: string; summary: string }>) {
  const items = [
    ...failures.map((check) => `Fix ${check.name}: ${check.summary}`),
    ...warnings.map((check) => `Review ${check.name}: ${check.summary}`)
  ];

  return items.length > 0 ? items : ['No action required. Keep the monitor scheduled and review logs regularly.'];
}
