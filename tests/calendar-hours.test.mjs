import test from 'node:test';
import assert from 'node:assert/strict';

test('deriveCalendarHours uses active availability bounds', async () => {
  const { deriveCalendarHours } = await import('../components/dashboard/calendar-hours.ts');

  const hours = deriveCalendarHours([
    {
      id: 'a1',
      business_id: 'biz_1',
      day_of_week: 1,
      start_time: '09:00:00',
      end_time: '17:00:00',
      is_active: true,
    },
    {
      id: 'a2',
      business_id: 'biz_1',
      day_of_week: 2,
      start_time: '10:00:00',
      end_time: '15:00:00',
      is_active: true,
    },
    {
      id: 'a3',
      business_id: 'biz_1',
      day_of_week: 3,
      start_time: '07:00:00',
      end_time: '12:00:00',
      is_active: false,
    },
  ]);

  assert.deepEqual(hours, [9, 10, 11, 12, 13, 14, 15, 16]);
});

test('formatCalendarHourLabel keeps local slot labels stable', async () => {
  const { formatCalendarHourLabel } = await import('../components/dashboard/calendar-hours.ts');

  assert.equal(formatCalendarHourLabel(9), '9:00 AM');
  assert.equal(formatCalendarHourLabel(17), '5:00 PM');
});
