import { CalendarView } from '@/components/dashboard/CalendarView';
import { demoBookings, demoBusiness } from '@/lib/demo-data';

export default function Page() {
  return <CalendarView business={demoBusiness} bookings={demoBookings} />;
}
