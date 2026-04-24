export function calculateAvailableSlots(
  availabilityRecord: { start_time: string; end_time: string } | null,
  serviceDuration: number,
  bufferAfter: number,
  existingBookings: { start_time: Date; end_time: Date }[],
  blockedTimes: { start_time: Date; end_time: Date }[],
  date: Date,
  timezone: string,
): string[] {
  void timezone;
  if (!availabilityRecord) return [];

  const base = date.toISOString().slice(0, 10);
  const dayStart = mergeDateAndTime(base, availabilityRecord.start_time);
  const dayEnd = mergeDateAndTime(base, availabilityRecord.end_time);
  const slots: string[] = [];

  for (
    let curr = new Date(dayStart);
    curr < dayEnd;
    curr = new Date(curr.getTime() + 60 * 60000)
  ) {
    const end = new Date(
      curr.getTime() + (serviceDuration + bufferAfter) * 60000,
    );
    if (end > dayEnd) continue;

    const overlapsBooking = existingBookings.some(
      (booking) => curr < booking.end_time && end > booking.start_time,
    );
    const overlapsBlocked = blockedTimes.some(
      (blocked) => curr < blocked.end_time && end > blocked.start_time,
    );

    if (!overlapsBooking && !overlapsBlocked) {
      slots.push(curr.toISOString().slice(11, 16));
    }
  }

  return slots;
}

export function mergeDateAndTime(date: string, time: string) {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
  const merged = new Date(`${date}T00:00:00`);
  merged.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return merged;
}
