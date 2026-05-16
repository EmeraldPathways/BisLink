import type { SupportTicketDraft } from '@/lib/agents/types';
import type { SupportTicketRecord } from '@/types';

type CreateSupportTicketArgs = {
  supabase: {
    from: (table: 'support_tickets') => any;
  };
  businessId: string;
  customerName: string | null;
  customerEmail: string | null;
  draft: SupportTicketDraft;
  ticketType: 'owner_support' | 'escalation';
};

function formatDraftMessage(draft: SupportTicketDraft) {
  return [
    `Severity: ${draft.severity}`,
    `Affected area: ${draft.affectedArea}`,
    draft.stepsToReproduce ? `Steps to reproduce: ${draft.stepsToReproduce}` : null,
    draft.expectedResult ? `Expected result: ${draft.expectedResult}` : null,
    draft.actualResult ? `Actual result: ${draft.actualResult}` : null,
    draft.evidence ? `Evidence: ${draft.evidence}` : null,
    draft.developerNotes ? `Developer notes: ${draft.developerNotes}` : null
  ]
    .filter(Boolean)
    .join('\n');
}

export async function createSupportTicket({
  supabase,
  businessId,
  customerName,
  customerEmail,
  draft,
  ticketType
}: CreateSupportTicketArgs): Promise<SupportTicketRecord | null> {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      business_id: businessId,
      ticket_type: ticketType,
      status: 'open',
      priority:
        draft.severity === 'P0' || draft.severity === 'P1' ? 'high' : 'normal',
      source: 'owner_dashboard',
      created_by_role: 'owner',
      subject: draft.title,
      message: formatDraftMessage(draft),
      customer_name: customerName,
      customer_email: customerEmail
    })
    .select(
      'id,business_id,ticket_type,status,priority,source,created_by_role,subject,message,customer_name,customer_email,assigned_admin_email,resolved_at,created_at,updated_at'
    )
    .single();

  if (error) {
    throw error;
  }

  return data as SupportTicketRecord;
}
