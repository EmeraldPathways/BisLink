import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient() ?? (await createClient());
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id,status,payment_status,google_event_id')
    .eq('id', id)
    .maybeSingle();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json({ booking });
}
