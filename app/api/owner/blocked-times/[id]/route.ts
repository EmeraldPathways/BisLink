import { NextResponse } from 'next/server';
import { requireOwnerBusiness } from '@/lib/owner-api';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const owner = await requireOwnerBusiness();
  if (!owner)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { supabase, business } = owner;
  const { error } = await supabase
    .from('blocked_times')
    .delete()
    .eq('id', params.id)
    .eq('business_id', business.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
