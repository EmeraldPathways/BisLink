import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/admin-api';
import { getAgentDiagnostics } from '@/lib/agent-diagnostics';

export async function GET(req: Request) {
  const adminUser = await requireAdminApiUser();
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') === 'full' ? 'full' : 'quick';
  const diagnostics = await getAgentDiagnostics(mode);
  return NextResponse.json(diagnostics);
}
