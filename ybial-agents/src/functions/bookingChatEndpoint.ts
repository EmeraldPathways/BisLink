import { http, type HttpFunction } from '@google-cloud/functions-framework';
import { z } from 'zod';
import { runBookingChat } from '../agents/bookingChat';
import { buildBookingChatContext } from '../lib/contextBuilders';

const payloadSchema = z.object({
  slug: z.string(),
  message: z.string(),
  conversationHistory: z.array(z.object({ role: z.string(), content: z.string() })).default([])
});

const sessionCounts = new Map<string, number>();

export const bookingChatEndpoint: HttpFunction = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Id');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const payload = payloadSchema.parse(req.body);
    const sessionId = req.get('X-Session-Id') ?? 'anonymous';
    const count = (sessionCounts.get(sessionId) ?? 0) + 1;
    sessionCounts.set(sessionId, count);

    if (count > 20) {
      res.status(200).json({ reply: 'To continue, please reach out via Instagram.' });
      return;
    }

    const context = await buildBookingChatContext(payload.slug, payload.conversationHistory, payload.message);
    const output = await runBookingChat(context);
    res.status(200).json(output);
  } catch (error: any) {
    if (error?.message === 'Business not found') {
      res.status(404).json({ error: 'Business not found' });
      return;
    }

    console.error(error);
    res.status(200).json({ reply: "Sorry, I'm having a moment — tap the service you'd like to book!" });
  }
};

http('bookingChatEndpoint', bookingChatEndpoint);
