import { http, type HttpFunction } from '@google-cloud/functions-framework';
import { z } from 'zod';
import { buildSupportContext } from '../lib/contextBuilders';
import { sendAgentEmail } from '../lib/resend';
import { supabaseAdmin } from '../lib/supabase';
import { runSupportAgent } from '../agents/supportAgent';

const bodySchema = z.object({
  businessId: z.string(),
  message: z.string(),
  conversationHistory: z.array(
    z.object({
      role: z.union([z.literal('user'), z.literal('assistant')]),
      content: z.string(),
      timestamp: z.string().optional().default(new Date().toISOString())
    })
  )
});

export const supportChat: HttpFunction = async (req, res) => {
  res.set('Access-Control-Allow-Origin', process.env.APP_URL ?? '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const authHeader = req.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const userResult = await supabaseAdmin.auth.getUser(token);
    if (!userResult.data.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const payload = bodySchema.parse(req.body);
    const context = await buildSupportContext(payload.businessId, payload.conversationHistory as any, payload.message);
    const output = await runSupportAgent(context);

    if (output.shouldEscalateToHuman) {
      await sendAgentEmail({
        to: process.env.ESCALATION_EMAIL ?? 'andrew@yourbusinessinalink.com',
        subject: `Support escalation: ${context.businessName}`,
        body: `${output.escalationReason ?? 'Escalation requested'}\n\nMessage: ${payload.message}`
      });
    }

    res.status(200).json({
      reply: output.reply,
      shouldEscalateToHuman: output.shouldEscalateToHuman,
      actionTaken: output.actionTaken ?? null
    });
  } catch (error: any) {
    console.error(error);
    res.status(200).json({
      reply: "I'm not sure — let me flag this for the team.",
      shouldEscalateToHuman: true,
      actionTaken: null
    });
  }
};

http('supportChat', supportChat);
