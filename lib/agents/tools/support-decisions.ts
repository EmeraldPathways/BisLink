import { isMissingRelationError } from '@/lib/supabase/schema-compat';
import type {
  RouterResult,
  SetupCompletionOutput,
  SupportAgentOutput,
  TechnicalTriageOutput
} from '@/lib/agents/types';
import type { SupportDecisionRecord, SupportReviewLabel } from '@/types';

type SupportDecisionSupabase = {
  from: (table: 'support_decisions') => any;
};

type PersistDecisionResult = RouterResult | SupportAgentOutput | SetupCompletionOutput | TechnicalTriageOutput;

export async function persistSupportDecision({
  supabase,
  conversationId,
  userId,
  businessId,
  message,
  decision,
  reply,
  needsFollowUp,
  ticketId,
  reason,
  fallbackUsed = false
}: {
  supabase: SupportDecisionSupabase;
  conversationId?: string | null;
  userId?: string | null;
  businessId?: string | null;
  message: string;
  decision: PersistDecisionResult;
  reply?: string | null;
  needsFollowUp?: boolean;
  ticketId?: string | null;
  reason?: string | null;
  fallbackUsed?: boolean;
}): Promise<SupportDecisionRecord | null> {
  const { data, error } = await supabase
    .from('support_decisions')
    .insert({
      conversation_id: conversationId ?? null,
      user_id: userId ?? null,
      business_id: businessId ?? null,
      route: decision.route,
      domain: decision.domain,
      decision_type: decision.decisionType,
      confidence: decision.confidence,
      requires_human: decision.requiresHuman,
      fallback_used: fallbackUsed,
      needs_follow_up: needsFollowUp ?? false,
      ticket_id: ticketId ?? null,
      support_message: message,
      assistant_reply: reply ?? null,
      reason: reason ?? ('reason' in decision ? decision.reason : null),
      suggested_action_href: decision.suggestedActionHref ?? null,
      evidence_refs: decision.evidenceRefs,
      knowledge_area_ids:
        'knowledgeAreaIds' in decision ? decision.knowledgeAreaIds : []
    })
    .select(
      'id,conversation_id,user_id,business_id,route,domain,decision_type,confidence,requires_human,fallback_used,needs_follow_up,escalated_later,ticket_id,support_message,assistant_reply,reason,suggested_action_href,evidence_refs,knowledge_area_ids,review_label,review_notes,reviewed_by_admin_email,reviewed_at,created_at,updated_at'
    )
    .single();

  if (error) {
    if (isMissingRelationError(error, 'support_decisions')) {
      return null;
    }
    throw error;
  }

  return data as SupportDecisionRecord;
}

export async function markConversationEscalatedLater({
  supabase,
  conversationId
}: {
  supabase: SupportDecisionSupabase;
  conversationId?: string | null;
}) {
  if (!conversationId) {
    return false;
  }

  const { data: decisions, error: queryError } = await supabase
    .from('support_decisions')
    .select('id,decision_type')
    .eq('conversation_id', conversationId)
    .eq('escalated_later', false)
    .order('created_at', { ascending: false })
    .limit(5);

  if (queryError) {
    if (isMissingRelationError(queryError, 'support_decisions')) {
      return false;
    }
    throw queryError;
  }

  const candidate = (decisions as Array<{ id: string; decision_type: string }> | null)?.find(
    (item) => item.decision_type !== 'human_escalation'
  );

  if (!candidate) {
    return false;
  }

  const { error } = await supabase
    .from('support_decisions')
    .update({
      escalated_later: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', candidate.id);

  if (error) {
    if (isMissingRelationError(error, 'support_decisions')) {
      return false;
    }
    throw error;
  }

  return true;
}

export async function getLatestSupportDecisionsByConversationId({
  supabase,
  conversationIds
}: {
  supabase: SupportDecisionSupabase;
  conversationIds: string[];
}) {
  if (!conversationIds.length) {
    return {};
  }

  const { data, error } = await supabase
    .from('support_decisions')
    .select(
      'id,conversation_id,user_id,business_id,route,domain,decision_type,confidence,requires_human,fallback_used,needs_follow_up,escalated_later,ticket_id,support_message,assistant_reply,reason,suggested_action_href,evidence_refs,knowledge_area_ids,review_label,review_notes,reviewed_by_admin_email,reviewed_at,created_at,updated_at'
    )
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingRelationError(error, 'support_decisions')) {
      return {};
    }
    throw error;
  }

  return ((data ?? []) as SupportDecisionRecord[]).reduce<Record<string, SupportDecisionRecord>>(
    (acc, decision) => {
      if (!decision.conversation_id || acc[decision.conversation_id]) {
        return acc;
      }
      acc[decision.conversation_id] = decision;
      return acc;
    },
    {}
  );
}

export async function reviewSupportDecision({
  supabase,
  decisionId,
  reviewLabel,
  reviewNotes,
  reviewedByAdminEmail
}: {
  supabase: SupportDecisionSupabase;
  decisionId: string;
  reviewLabel: SupportReviewLabel;
  reviewNotes?: string;
  reviewedByAdminEmail?: string | null;
}) {
  const { data, error } = await supabase
    .from('support_decisions')
    .update({
      review_label: reviewLabel,
      review_notes: reviewNotes?.trim() ? reviewNotes.trim() : null,
      reviewed_by_admin_email: reviewedByAdminEmail ?? null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', decisionId)
    .select(
      'id,conversation_id,user_id,business_id,route,domain,decision_type,confidence,requires_human,fallback_used,needs_follow_up,escalated_later,ticket_id,support_message,assistant_reply,reason,suggested_action_href,evidence_refs,knowledge_area_ids,review_label,review_notes,reviewed_by_admin_email,reviewed_at,created_at,updated_at'
    )
    .single();

  if (error) {
    if (isMissingRelationError(error, 'support_decisions')) {
      return null;
    }
    throw error;
  }

  return data as SupportDecisionRecord;
}
