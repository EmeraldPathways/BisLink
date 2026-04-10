export async function createGoogleCalendarEvent(bookingId?: string) {
  return { id: bookingId ? `google-event-${bookingId}` : 'google-event-demo' };
}
