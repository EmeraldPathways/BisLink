import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findRelevantHelpDocs } from '@/lib/agents/knowledge/help-docs';
import { routeSupportMessage } from '@/lib/agents/router';
import { runSetupCompletionHelper } from '@/lib/agents/setup-completion-helper';
import { runSupportAgent } from '@/lib/agents/support-agent';
import { runTechnicalTriageAgent } from '@/lib/agents/technical-triage-agent';
import { getActivationStatus } from '@/lib/agents/tools/get-activation-status';
import { createSupportTicket } from '@/lib/agents/tools/create-support-ticket';
import { getUserSupportContext } from '@/lib/agents/tools/get-user-context';
import {
  getLatestSupportConversation,
  getOrCreateSupportConversation,
  getSupportConversationById,
  listSupportConversationMessages,
  saveSupportMessage,
  updateSupportConversationAgent
} from '@/lib/agents/tools/support-conversations';
import type { SupportTicketDraft } from '@/lib/agents/types';
import { requireOwnerBusiness } from '@/lib/owner-api';
import {
  detectEscalation,
  getEscalationFollowUpQuestion
} from '@/lib/agents/escalation';

const schema = z.object({
  message: z.string().trim().min(1).max(4000),
  conversationId: z.string().trim().nullable().optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().trim().min(1).max(4000)
      })
    )
    .max(20)
    .optional()
});

function buildEscalationDraft(
  message: string,
  userId: string,
  userEmail: string | null,
  publicUrl: string | null
): SupportTicketDraft {
  return {
    title: `Human escalation: ${message.slice(0, 72)}`,
    severity: 'P1',
    affectedArea: 'human_support',
    userId,
    userEmail,
    bislinkUrl: publicUrl,
    actualResult: message,
    suggestedPriority: 'high',
    developerNotes: 'Escalated by deterministic support safety rules.'
  };
}

export async function GET(req: NextRequest) {
  const owner = await requireOwnerBusiness();
  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversationId = req.nextUrl.searchParams.get('conversationId');
  const conversation = conversationId
    ? await getSupportConversationById({
        supabase: owner.supabase,
        conversationId,
        userId: owner.user.id
      })
    : await getLatestSupportConversation({
        supabase: owner.supabase,
        userId: owner.user.id
      });

  const messages =
    conversation
      ? await listSupportConversationMessages({
          supabase: owner.supabase,
          conversationId: conversation.id,
          userId: owner.user.id
        })
      : [];
  const context = await getUserSupportContext(owner.user.id);
  const activationStatus = await getActivationStatus(context);

  return NextResponse.json({
    conversationId: conversation?.id ?? null,
    messages,
    activationStatus
  });
}

export async function POST(req: NextRequest) {
  const owner = await requireOwnerBusiness();
  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const conversation = await getOrCreateSupportConversation({
    supabase: owner.supabase,
    conversationId: parsed.data.conversationId ?? undefined,
    userId: owner.user.id,
    businessId: owner.business.id,
    initialMessage: parsed.data.message
  });
  const persistedHistory = conversation
    ? await listSupportConversationMessages({
        supabase: owner.supabase,
        conversationId: conversation.id,
        userId: owner.user.id
      })
    : [];
  const conversationHistory =
    persistedHistory.length > 0
      ? persistedHistory
      : (parsed.data.conversationHistory ?? []);

  const context = await getUserSupportContext(owner.user.id);
  const activationStatus = await getActivationStatus(context);
  const relevantDocs = findRelevantHelpDocs(parsed.data.message);
  const escalation = detectEscalation(parsed.data.message, context);
  const router = await routeSupportMessage({
    message: parsed.data.message,
    context,
    activationStatus,
    conversationHistory,
    currentRoute: conversation?.current_agent
  });
  if (conversation) {
    await saveSupportMessage({
      supabase: owner.supabase,
      conversationId: conversation.id,
      role: 'user',
      content: parsed.data.message
    });
    await updateSupportConversationAgent({
      supabase: owner.supabase,
      conversationId: conversation.id,
      route: router.route
    });
  }

  if (router.route === 'human_escalation' || escalation) {
    const isEscalationFollowUp =
      !escalation && conversation?.current_agent === 'human_escalation';

    if (isEscalationFollowUp) {
      const reply =
        'Thanks. I added that detail to the escalation context for the support team.';

      if (conversation) {
        await saveSupportMessage({
          supabase: owner.supabase,
          conversationId: conversation.id,
          role: 'assistant',
          content: reply,
          agentName: 'human_escalation'
        });
      }

      return NextResponse.json({
        reply,
        route: 'human_escalation',
        requiresHuman: true,
        activationStatus,
        ticketDraft: null,
        ticketId: null,
        conversationId: conversation?.id ?? null,
        suggestedActionHref: '/support'
      });
    }

    const ticketDraft = buildEscalationDraft(
      parsed.data.message,
      owner.user.id,
      owner.user.email ?? null,
      context.publicUrl ?? null
    );

    const ticket = context.businessId
      ? await createSupportTicket({
          supabase: owner.supabase,
          businessId: context.businessId,
          conversationId: conversation?.id ?? null,
          customerName: context.businessName ?? null,
          customerEmail: owner.user.email ?? null,
          draft: ticketDraft,
          ticketType: 'escalation'
        })
      : null;

    const followUpQuestion = escalation
      ? getEscalationFollowUpQuestion(escalation.issueType)
      : 'Please reply with the key details so the support team can review this quickly.';
    const reply =
      `This issue needs human review. I created an escalation summary for the support team. ${followUpQuestion}`;

    if (conversation) {
      await saveSupportMessage({
        supabase: owner.supabase,
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
        agentName: 'human_escalation'
      });
    }

    return NextResponse.json({
      reply,
      route: 'human_escalation',
      requiresHuman: true,
      activationStatus,
      ticketDraft,
      ticketId: ticket?.id ?? null,
      conversationId: conversation?.id ?? null,
      suggestedActionHref: '/support'
    });
  }

  if (router.route === 'setup_completion') {
    const result = await runSetupCompletionHelper({
      message: parsed.data.message,
      context,
      activationStatus
    });

    if (conversation) {
      await saveSupportMessage({
        supabase: owner.supabase,
        conversationId: conversation.id,
        role: 'assistant',
        content: result.reply,
        agentName: result.route
      });
    }

    return NextResponse.json({
      ...result,
      activationStatus,
      ticketDraft: null,
      conversationId: conversation?.id ?? null
    });
  }

  if (router.route === 'technical_triage') {
    const result = await runTechnicalTriageAgent({
      message: parsed.data.message,
      context,
      activationStatus
    });

    const ticket =
      result.ticketDraft && context.businessId
        ? await createSupportTicket({
            supabase: owner.supabase,
            businessId: context.businessId,
            conversationId: conversation?.id ?? null,
            customerName: context.businessName ?? null,
            customerEmail: owner.user.email ?? null,
            draft: result.ticketDraft,
            ticketType: result.requiresHuman ? 'escalation' : 'owner_support'
          })
        : null;

    if (conversation) {
      await saveSupportMessage({
        supabase: owner.supabase,
        conversationId: conversation.id,
        role: 'assistant',
        content: result.reply,
        agentName: result.route
      });
    }

    return NextResponse.json({
      ...result,
      activationStatus,
      ticketDraft: result.ticketDraft ?? null,
      ticketId: ticket?.id ?? null,
      conversationId: conversation?.id ?? null
    });
  }

  const result = await runSupportAgent({
    message: parsed.data.message,
    context,
    activationStatus,
    relevantDocs,
    conversationHistory
  });

  if (conversation) {
    await saveSupportMessage({
      supabase: owner.supabase,
      conversationId: conversation.id,
      role: 'assistant',
      content: result.reply,
      agentName: result.route
    });
  }

  return NextResponse.json({
    ...result,
    activationStatus,
    ticketDraft: null,
    conversationId: conversation?.id ?? null
  });
}
