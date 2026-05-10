import { CalendarView } from '@/components/dashboard/CalendarView';
import { getCalendarData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { business, bookings, availability } = await getCalendarData();
  return (
    <CalendarView
      business={business}
      bookings={bookings}
      availability={availability}
    />
  );
}
