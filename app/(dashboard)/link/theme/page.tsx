import { LinkWorkspace } from '@/components/dashboard/LinkWorkspace';
import { getLinkData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { publicPage } = await getLinkData();
  return <LinkWorkspace publicPage={publicPage} mode="theme" />;
}
