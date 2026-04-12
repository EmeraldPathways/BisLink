import { http, type HttpFunction } from '@google-cloud/functions-framework';
import { z } from 'zod';
import { runManagerAgent } from '../agents/managerAgent';
import { runDiagnostics } from '../lib/healthMonitor';

const payloadSchema = z.object({
  mode: z.union([z.literal('quick'), z.literal('full')]).optional().default('quick'),
  secret: z.string().optional()
});

export const managerHealth: HttpFunction = async (req, res) => {
  const authSecret = req.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? req.body?.secret;
  if (authSecret !== (process.env.WEBHOOK_SECRET ?? '')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const payload = payloadSchema.parse(req.body ?? {});
    const diagnostics = await runDiagnostics(payload.mode);
    const manager = await runManagerAgent({ diagnostics });
    const statusCode = diagnostics.overallStatus === 'down' ? 503 : 200;

    res.status(statusCode).json({
      manager,
      diagnostics
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Manager health check failed' });
  }
};

http('managerHealth', managerHealth);
