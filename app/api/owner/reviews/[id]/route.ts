import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';

const schema = z.object({
  is_published: z.boolean()
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const owner = await requireOwnerBusiness();
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { supabase, business } = owner;
  const { data, error } = await supabase
    .from('reviews')
    .update({ is_published: parsed.data.is_published })
    .eq('id', params.id)
    .eq('business_id', business.id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: data });
}
