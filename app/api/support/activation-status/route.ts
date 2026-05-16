import { NextResponse } from 'next/server';
import { requireOwnerBusiness } from '@/lib/owner-api';
import { getActivationStatus } from '@/lib/agents/tools/get-activation-status';
import { getUserSupportContext } from '@/lib/agents/tools/get-user-context';

export async function GET() {
  const owner = await requireOwnerBusiness();
  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const context = await getUserSupportContext(owner.user.id);
  const activationStatus = await getActivationStatus(context);

  return NextResponse.json(activationStatus);
}
