import type { AvailabilityRecord } from '@/types';

const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 17;

export function deriveCalendarHours(availability: AvailabilityRecord[]) {
  const activeAvailability = availability.filter((record) => record.is_active);
  if (activeAvailability.length === 0) {
    return buildHourRange(DEFAULT_START_HOUR, DEFAULT_END_HOUR);
  }

  const startHour = Math.min(...activeAvailability.map((record) => getHourFloor(record.start_time)));
  const endHour = Math.max(...activeAvailability.map((record) => getHourCeil(record.end_time)));

  return buildHourRange(startHour, endHour);
}

export function formatCalendarHourLabel(hour: number) {
  const normalizedHour = ((hour % 24) + 24) % 24;
  const suffix = normalizedHour >= 12 ? 'PM' : 'AM';
  const hour12 = normalizedHour % 12 || 12;
  return `${hour12}:00 ${suffix}`;
}

function buildHourRange(startHour: number, endHour: number) {
  const normalizedStart = clampHour(startHour);
  const normalizedEnd = Math.max(normalizedStart + 1, clampHour(endHour));

  return Array.from(
    { length: normalizedEnd - normalizedStart },
    (_, index) => normalizedStart + index,
  );
}

function getHourFloor(value: string) {
  return clampHour(Number(value.slice(0, 2)));
}

function getHourCeil(value: string) {
  const hour = clampHour(Number(value.slice(0, 2)));
  const minutes = Number(value.slice(3, 5));
  return clampHour(hour + (minutes > 0 ? 1 : 0));
}

function clampHour(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_START_HOUR;
  return Math.min(Math.max(value, 0), 24);
}
