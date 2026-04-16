import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createAdminClient() ?? createClient();
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id,status,payment_status,google_event_id')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json({ booking });
}
