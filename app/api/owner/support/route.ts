import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';

const schema = z.object({
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000)
});

export async function POST(req: NextRequest) {
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

  const { business, supabase, user } = owner;
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      business_id: business.id,
      ticket_type: 'owner_support',
      status: 'open',
      priority: 'normal',
      source: 'owner_dashboard',
      created_by_role: 'owner',
      subject: parsed.data.subject,
      message: parsed.data.message,
      customer_name: business.name,
      customer_email: user.email ?? business.contact_email ?? business.email ?? null
    })
    .select(
      'id,business_id,ticket_type,status,priority,source,created_by_role,subject,message,customer_name,customer_email,assigned_admin_email,resolved_at,created_at,updated_at'
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ticket: data });
}
