import { CalendarView } from '@/components/dashboard/CalendarView';
import { getCalendarData } from '@/lib/dashboard-data';

export default async function Page() {
  const { business, bookings } = await getCalendarData();
  return <CalendarView business={business} bookings={bookings} />;
}
