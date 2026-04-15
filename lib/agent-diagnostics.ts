import path from 'node:path';
import { pathToFileURL } from 'node:url';

type AgentDiagnostics = {
  timestamp: string;
  mode: 'quick' | 'full';
  checks: Array<{
    name: string;
    level: 'ok' | 'warn' | 'fail';
    summary: string;
    details?: unknown;
  }>;
  summary: {
    ok: number;
    warn: number;
    fail: number;
  };
  overallStatus: 'healthy' | 'degraded' | 'down';
};

export async function getAgentDiagnostics(mode: 'quick' | 'full' = 'quick'): Promise<AgentDiagnostics> {
  const modulePath = path.join(process.cwd(), 'ybial-agents', 'dist', 'src', 'lib', 'healthMonitor.js');

  try {
    const diagnosticsModule = (await import(pathToFileURL(modulePath).href)) as {
      runDiagnostics?: (selectedMode?: 'quick' | 'full') => Promise<AgentDiagnostics>;
    };

    if (!diagnosticsModule.runDiagnostics) {
      throw new Error('runDiagnostics export not found');
    }

    return await diagnosticsModule.runDiagnostics(mode);
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      mode,
      checks: [
        {
          name: 'agent.loader',
          level: 'fail',
          summary: error instanceof Error ? error.message : 'Unable to load agent diagnostics'
        }
      ],
      summary: { ok: 0, warn: 0, fail: 1 },
      overallStatus: 'down'
    };
  }
}
