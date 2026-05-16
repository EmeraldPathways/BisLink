import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';

const schema = z.object({
  content: z.string().trim().min(1).max(4000)
});

export async function POST(
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
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { supabase, business } = owner;
  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .select('id,conversation_id,status')
    .eq('id', id)
    .eq('business_id', business.id)
    .single();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  if (!ticket.conversation_id) {
    return NextResponse.json(
      { error: 'This ticket is not linked to a support conversation yet.' },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const { error: messageError } = await supabase.from('support_messages').insert({
    conversation_id: ticket.conversation_id,
    role: 'user',
    content: parsed.data.content,
    agent_name: null
  });

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 500 });
  }

  const { error: conversationError } = await supabase
    .from('support_conversations')
    .update({
      updated_at: now
    })
    .eq('id', ticket.conversation_id);

  if (conversationError) {
    return NextResponse.json({ error: conversationError.message }, { status: 500 });
  }

  const { data: updatedTicket, error: updateError } = await supabase
    .from('support_tickets')
    .update({
      status: ticket.status === 'resolved' ? 'in_progress' : ticket.status,
      resolved_at: ticket.status === 'resolved' ? null : undefined,
      updated_at: now
    })
    .eq('id', id)
    .eq('business_id', business.id)
    .select(
      'id,business_id,conversation_id,ticket_type,status,priority,source,created_by_role,subject,message,customer_name,customer_email,assigned_admin_email,resolved_at,created_at,updated_at'
    )
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ticket: updatedTicket });
}
