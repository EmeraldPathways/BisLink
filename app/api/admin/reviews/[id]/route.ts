import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApiUser } from '@/lib/admin-api';

const schema = z.object({
  is_published: z.boolean()
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const adminUser = await requireAdminApiUser();
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await adminUser.admin
    .from('reviews')
    .update({ is_published: parsed.data.is_published })
    .eq('id', params.id)
    .select('id,is_published')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data });
}
