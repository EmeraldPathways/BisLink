export function calculateAvailableSlots(
  availabilityRecord: { start_time: string; end_time: string } | null,
  serviceDuration: number,
  bufferAfter: number,
  existingBookings: { start_time: Date; end_time: Date }[],
  blockedTimes: { start_time: Date; end_time: Date }[],
  date: Date,
  timezone: string
): string[] {
  if (!availabilityRecord) return [];
  const base = date.toISOString().slice(0, 10);
  const dayStart = new Date(`${base}T${availabilityRecord.start_time}`);
  const dayEnd = new Date(`${base}T${availabilityRecord.end_time}`);
  const slots: string[] = [];
  for (let curr = new Date(dayStart); curr < dayEnd; curr = new Date(curr.getTime() + 30 * 60000)) {
    const end = new Date(curr.getTime() + (serviceDuration + bufferAfter) * 60000);
    if (end > dayEnd) continue;
    const overlapsBooking = existingBookings.some((b) => curr < b.end_time && end > b.start_time);
    const overlapsBlocked = blockedTimes.some((b) => curr < b.end_time && end > b.start_time);
    if (!overlapsBooking && !overlapsBlocked) slots.push(curr.toISOString());
  }
  return slots;
}
