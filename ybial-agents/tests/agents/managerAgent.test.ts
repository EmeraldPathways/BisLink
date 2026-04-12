jest.mock('../../src/lib/anthropic', () => ({
  MODELS: { HAIKU: 'haiku', SONNET: 'sonnet' },
  callWithCache: jest.fn(),
  parseAgentJSON: jest.fn((value: string) => JSON.parse(value))
}));

import { callWithCache } from '../../src/lib/anthropic';
import { runManagerAgent } from '../../src/agents/managerAgent';

describe('runManagerAgent', () => {
  const context = {
    diagnostics: {
      timestamp: new Date().toISOString(),
      mode: 'full' as const,
      checks: [{ name: 'dependency.supabase', level: 'ok' as const, summary: 'Supabase responded' }],
      summary: { ok: 1, warn: 0, fail: 0 },
      overallStatus: 'healthy' as const
    }
  };

  it('parses manager output from Claude', async () => {
    (callWithCache as jest.Mock).mockResolvedValue(
      JSON.stringify({
        overallStatus: 'healthy',
        summary: 'All checks passed.',
        criticalIssues: [],
        recommendations: ['No action required.']
      })
    );

    const result = await runManagerAgent(context);
    expect(result.overallStatus).toBe('healthy');
    expect(result.summary).toBe('All checks passed.');
  });

  it('falls back to deterministic output if the call fails', async () => {
    (callWithCache as jest.Mock).mockRejectedValue(new Error('Anthropic failed'));

    const result = await runManagerAgent({
      diagnostics: {
        ...context.diagnostics,
        checks: [{ name: 'dependency.anthropic', level: 'fail', summary: 'Anthropic failed' }],
        summary: { ok: 0, warn: 0, fail: 1 },
        overallStatus: 'down'
      }
    });

    expect(result.overallStatus).toBe('down');
    expect(result.criticalIssues[0]).toContain('dependency.anthropic');
  });
});
