export function getBusinessTodayKey(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function getDayKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function isSameBusinessDay(value: string, dayKey: string, timezone: string): boolean {
  return getDayKey(new Date(value), timezone) === dayKey;
}

export function getHourInTimezone(value: string, timezone: string): number {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false,
    }).format(new Date(value)),
  );
}

export function shiftDayKey(dayKey: string, amount: number): string {
  const date = dayKeyToUtcDate(dayKey);
  date.setUTCDate(date.getUTCDate() + amount);
  return getUtcDayKey(date);
}

export function getStartOfWeekKey(dayKey: string): string {
  const date = dayKeyToUtcDate(dayKey);
  const weekdayIndex = (date.getUTCDay() + 6) % 7;
  return shiftDayKey(dayKey, -weekdayIndex);
}

export function formatDayKey(
  dayKey: string,
  options: Intl.DateTimeFormatOptions,
  locale = 'en-US',
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    ...options,
  }).format(dayKeyToUtcDate(dayKey));
}

function dayKeyToUtcDate(dayKey: string): Date {
  const parts = dayKey.split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (
    year == null ||
    month == null ||
    day == null ||
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    throw new Error(`Invalid day key: ${dayKey}`);
  }

  return new Date(Date.UTC(year, month - 1, day, 12));
}

function getUtcDayKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}
