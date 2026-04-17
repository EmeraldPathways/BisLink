import { TodayView } from '@/components/dashboard/TodayView';
import { getTodayViewData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { business, bookings, stats } = await getTodayViewData();
  return <TodayView business={business} bookings={bookings} stats={stats} />;
}
