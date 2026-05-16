import { isMissingRelationError } from '@/lib/supabase/schema-compat';
import type {
  AgentRoute,
  ChatMessageRole,
  ConversationMessage,
  SupportConversationRecord,
  SupportMessageRecord
} from '@/lib/agents/types';

type SupportSupabase = {
  from: (table: 'support_conversations' | 'support_messages') => any;
};

function buildConversationTitle(message: string) {
  return message.trim().slice(0, 120) || 'Support chat';
}

export async function getOrCreateSupportConversation({
  supabase,
  conversationId,
  userId,
  businessId,
  initialMessage
}: {
  supabase: SupportSupabase;
  conversationId?: string;
  userId: string;
  businessId?: string | null;
  initialMessage: string;
}): Promise<SupportConversationRecord | null> {
  if (conversationId) {
    const { data, error } = await supabase
      .from('support_conversations')
      .select('id,user_id,business_id,status,current_agent,title,created_at,updated_at')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (isMissingRelationError(error, 'support_conversations')) {
        return null;
      }
      throw error;
    }

    if (data) {
      return data as SupportConversationRecord;
    }
  }

  const { data, error } = await supabase
    .from('support_conversations')
    .insert({
      user_id: userId,
      business_id: businessId ?? null,
      status: 'open',
      current_agent: 'support',
      title: buildConversationTitle(initialMessage)
    })
    .select('id,user_id,business_id,status,current_agent,title,created_at,updated_at')
    .single();

  if (error) {
    if (isMissingRelationError(error, 'support_conversations')) {
      return null;
    }
    throw error;
  }

  return data as SupportConversationRecord;
}

export async function getSupportConversationById({
  supabase,
  conversationId,
  userId
}: {
  supabase: SupportSupabase;
  conversationId: string;
  userId: string;
}): Promise<SupportConversationRecord | null> {
  const { data, error } = await supabase
    .from('support_conversations')
    .select('id,user_id,business_id,status,current_agent,title,created_at,updated_at')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error, 'support_conversations')) {
      return null;
    }
    throw error;
  }

  return data ? (data as SupportConversationRecord) : null;
}

export async function getLatestSupportConversation({
  supabase,
  userId
}: {
  supabase: SupportSupabase;
  userId: string;
}): Promise<SupportConversationRecord | null> {
  const { data, error } = await supabase
    .from('support_conversations')
    .select('id,user_id,business_id,status,current_agent,title,created_at,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error, 'support_conversations')) {
      return null;
    }
    throw error;
  }

  return data ? (data as SupportConversationRecord) : null;
}

export async function listSupportConversationMessages({
  supabase,
  conversationId,
  userId
}: {
  supabase: SupportSupabase;
  conversationId: string;
  userId: string;
}): Promise<ConversationMessage[]> {
  const { data: conversation, error: conversationError } = await supabase
    .from('support_conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (conversationError) {
    if (isMissingRelationError(conversationError, 'support_conversations')) {
      return [];
    }
    throw conversationError;
  }

  if (!conversation) {
    return [];
  }

  const { data, error } = await supabase
    .from('support_messages')
    .select('id,conversation_id,role,content,agent_name,created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    if (isMissingRelationError(error, 'support_messages')) {
      return [];
    }
    throw error;
  }

  return ((data ?? []) as SupportMessageRecord[]).map((message) => ({
    role: message.role,
    content: message.content
  }));
}

export async function listSupportConversationMessageRecords({
  supabase,
  conversationId,
  userId
}: {
  supabase: SupportSupabase;
  conversationId: string;
  userId: string;
}): Promise<SupportMessageRecord[]> {
  const { data: conversation, error: conversationError } = await supabase
    .from('support_conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (conversationError) {
    if (isMissingRelationError(conversationError, 'support_conversations')) {
      return [];
    }
    throw conversationError;
  }

  if (!conversation) {
    return [];
  }

  const { data, error } = await supabase
    .from('support_messages')
    .select('id,conversation_id,role,content,agent_name,created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    if (isMissingRelationError(error, 'support_messages')) {
      return [];
    }
    throw error;
  }

  return (data ?? []) as SupportMessageRecord[];
}

export async function saveSupportMessage({
  supabase,
  conversationId,
  role,
  content,
  agentName
}: {
  supabase: SupportSupabase;
  conversationId: string;
  role: ChatMessageRole;
  content: string;
  agentName?: AgentRoute | null;
}) {
  const { error } = await supabase.from('support_messages').insert({
    conversation_id: conversationId,
    role,
    content,
    agent_name: agentName ?? null
  });

  if (error) {
    if (
      isMissingRelationError(error, 'support_messages') ||
      isMissingRelationError(error, 'support_conversations')
    ) {
      return false;
    }
    throw error;
  }

  const { error: conversationError } = await supabase
    .from('support_conversations')
    .update({
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId);

  if (conversationError) {
    if (isMissingRelationError(conversationError, 'support_conversations')) {
      return true;
    }
    throw conversationError;
  }

  return true;
}

export async function updateSupportConversationAgent({
  supabase,
  conversationId,
  route
}: {
  supabase: SupportSupabase;
  conversationId: string;
  route: AgentRoute;
}) {
  const status = route === 'human_escalation' ? 'escalated' : 'open';
  const { error } = await supabase
    .from('support_conversations')
    .update({
      current_agent: route,
      status
    })
    .eq('id', conversationId);

  if (error) {
    if (isMissingRelationError(error, 'support_conversations')) {
      return false;
    }
    throw error;
  }

  return true;
}
