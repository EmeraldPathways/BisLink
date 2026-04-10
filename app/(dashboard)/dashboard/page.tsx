import { TodayView } from '@/components/dashboard/TodayView';
import { demoBookings, demoBusiness, demoStats } from '@/lib/demo-data';

export default function Page() {
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = demoBookings.filter((booking) => booking.start_time.startsWith(today));

  return <TodayView business={demoBusiness} bookings={todayBookings} stats={demoStats} />;
}
