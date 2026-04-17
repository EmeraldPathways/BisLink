import { CustomersList } from '@/components/dashboard/CustomersList';
import { getCustomersData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { business, customers } = await getCustomersData();

  return <CustomersList customers={customers} timezone={business.timezone} />;
}
