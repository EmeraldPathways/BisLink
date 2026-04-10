import { formatTimeLabel } from '@/lib/utils/formatting';
import { demoServices } from '@/lib/demo-data';
import type { BookingRecord, BusinessProfile } from '@/types';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 14 }, (_, index) => 7 + index);

export function CalendarView({ business, bookings }: { business: BusinessProfile; bookings: BookingRecord[] }) {
  return (
    <div className="rounded-[28px] border border-[var(--color-border)] bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-4xl">Weekly calendar</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Mon-Sun with hourly booking blocks.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm">Previous</button>
          <button className="rounded-xl bg-[var(--color-surface-3)] px-3 py-2 text-sm">Today</button>
          <button className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm">Next</button>
        </div>
      </div>

      <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] gap-2">
        <div />
        {days.map((day) => (
          <div key={day} className="pb-2 text-center text-sm font-semibold text-[var(--color-text-secondary)]">
            {day}
          </div>
        ))}
        {hours.map((hour) => (
          <FragmentRow
            key={hour}
            hour={hour}
            business={business}
            bookings={bookings.filter((booking) => new Date(booking.start_time).getHours() === hour)}
          />
        ))}
      </div>
    </div>
  );
}

function FragmentRow({
  hour,
  business,
  bookings
}: {
  hour: number;
  business: BusinessProfile;
  bookings: BookingRecord[];
}) {
  return (
    <>
      <div className="pt-4 text-sm text-[var(--color-text-secondary)]">
        {formatTimeLabel(new Date(`2024-01-01T${String(hour).padStart(2, '0')}:00:00`), business.timezone)}
      </div>
      {Array.from({ length: 7 }).map((_, index) => {
        const booking = bookings[index];
        const service = booking ? demoServices.find((item) => item.id === booking.service_id) : null;
        return (
          <div key={`${hour}-${index}`} className="min-h-[72px] rounded-[18px] bg-[var(--color-surface-2)] p-2">
            {booking && service ? (
              <div className={`rounded-[14px] px-2 py-2 text-xs ${colorForStatus(booking.status)}`}>
                <p className="font-semibold">{booking.customer_name}</p>
                <p>{service.name}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function colorForStatus(status: BookingRecord['status']) {
  if (status === 'completed') return 'bg-[var(--color-success)]/20 text-[var(--color-text-primary)]';
  if (status === 'cancelled') return 'bg-[var(--color-error)]/20 text-[var(--color-text-primary)]';
  return 'bg-[var(--color-void)] text-white';
}
