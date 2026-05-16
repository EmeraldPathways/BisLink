import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';
import type { SupportTicketRecord } from '@/types';

const schema = z
  .object({
    status: z.enum(['open', 'in_progress', 'resolved']).optional(),
    priority: z.enum(['normal', 'high']).optional(),
    escalate: z.boolean().optional()
  })
  .refine(
    (value) =>
      value.status !== undefined ||
      value.priority !== undefined ||
      value.escalate !== undefined,
    { message: 'At least one update is required' }
  );

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owner = await requireOwnerBusiness();
  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { supabase, business } = owner;
  const { data: existing, error: existingError } = await supabase
    .from('support_tickets')
    .select(
      'id,business_id,conversation_id,ticket_type,status,priority,source,created_by_role,subject,message,customer_name,customer_email,assigned_admin_email,resolved_at,created_at,updated_at'
    )
    .eq('id', id)
    .eq('business_id', business.id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const ticket = existing as SupportTicketRecord;
  if (parsed.data.escalate && ticket.source !== 'contact_form') {
    return NextResponse.json(
      { error: 'Only public support tickets can be escalated' },
      { status: 400 }
    );
  }

  const nextStatus = parsed.data.status ?? ticket.status;
  const updates = {
    status: nextStatus,
    priority: parsed.data.priority ?? ticket.priority,
    ticket_type:
      parsed.data.escalate && ticket.ticket_type === 'public_support'
        ? 'escalation'
        : ticket.ticket_type,
    resolved_at: nextStatus === 'resolved' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', id)
    .eq('business_id', business.id)
    .select(
      'id,business_id,conversation_id,ticket_type,status,priority,source,created_by_role,subject,message,customer_name,customer_email,assigned_admin_email,resolved_at,created_at,updated_at'
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ticket: data });
}
