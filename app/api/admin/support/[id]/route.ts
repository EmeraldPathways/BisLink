import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApiUser } from '@/lib/admin-api';

const schema = z
  .object({
    status: z.enum(['open', 'in_progress', 'resolved']).optional(),
    priority: z.enum(['normal', 'high']).optional(),
    assignToSelf: z.boolean().optional()
  })
  .refine(
    (value) =>
      value.status !== undefined ||
      value.priority !== undefined ||
      value.assignToSelf !== undefined,
    { message: 'At least one update is required' }
  );

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminUser = await requireAdminApiUser();
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: existing, error: existingError } = await adminUser.admin
    .from('support_tickets')
    .select('id,status,priority,assigned_admin_email')
    .eq('id', id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const nextStatus = parsed.data.status ?? existing.status;
  const { data, error } = await adminUser.admin
    .from('support_tickets')
    .update({
      status: nextStatus,
      priority: parsed.data.priority ?? existing.priority,
      assigned_admin_email: parsed.data.assignToSelf
        ? adminUser.user.email ?? existing.assigned_admin_email
        : existing.assigned_admin_email,
      resolved_at: nextStatus === 'resolved' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(
      'id,business_id,ticket_type,status,priority,source,created_by_role,subject,message,customer_name,customer_email,assigned_admin_email,resolved_at,created_at,updated_at'
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ticket: data });
}
