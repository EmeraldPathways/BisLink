import { CalendarView } from '@/components/dashboard/CalendarView';
import { getCalendarData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { business, bookings, availability } = await getCalendarData();
  const params = (await searchParams) ?? {};
  const googleCalendarStatus =
    typeof params.googleCalendar === 'string' ? params.googleCalendar : null;
  const googleCalendarReason =
    typeof params.reason === 'string' ? params.reason : null;

  return (
    <CalendarView
      business={business}
      bookings={bookings}
      availability={availability}
      googleCalendarStatus={googleCalendarStatus}
      googleCalendarReason={googleCalendarReason}
    />
  );
}
