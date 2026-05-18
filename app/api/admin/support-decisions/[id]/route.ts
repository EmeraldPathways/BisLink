import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { reviewSupportDecision } from '@/lib/agents/tools/support-decisions';
import { requireAdminApiUser } from '@/lib/admin-api';

const schema = z.object({
  reviewLabel: z.enum([
    'correct',
    'wrong_domain',
    'weak_knowledge',
    'bad_escalation',
    'poor_wording',
    'missing_rule'
  ]),
  reviewNotes: z.string().max(4000).optional()
});

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
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const decision = await reviewSupportDecision({
    supabase: adminUser.admin,
    decisionId: id,
    reviewLabel: parsed.data.reviewLabel,
    reviewNotes: parsed.data.reviewNotes,
    reviewedByAdminEmail: adminUser.user.email ?? null
  });

  if (!decision) {
    return NextResponse.json(
      { error: 'Support decision diagnostics are not available yet.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ decision });
}
