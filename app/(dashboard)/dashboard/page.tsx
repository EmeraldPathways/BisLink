import { TodayView } from '@/components/dashboard/TodayView';
import { getSupportAssistantData, getTodayViewData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [{ business, bookings, recentOrders, stats }, { activationStatus }] =
    await Promise.all([getTodayViewData(), getSupportAssistantData()]);
  return (
    <TodayView
      activationStatus={activationStatus}
      business={business}
      bookings={bookings}
      recentOrders={recentOrders}
      stats={stats}
    />
  );
}
