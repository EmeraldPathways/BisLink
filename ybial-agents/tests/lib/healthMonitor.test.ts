import { determineOverallStatus } from '../../src/lib/healthMonitor';

describe('determineOverallStatus', () => {
  it('returns healthy when all checks are ok', () => {
    expect(
      determineOverallStatus([{ name: 'a', level: 'ok', summary: 'ok' }])
    ).toBe('healthy');
  });

  it('returns degraded when warnings exist and no failures exist', () => {
    expect(
      determineOverallStatus([{ name: 'a', level: 'warn', summary: 'warn' }])
    ).toBe('degraded');
  });

  it('returns down when any failure exists', () => {
    expect(
      determineOverallStatus([
        { name: 'a', level: 'ok', summary: 'ok' },
        { name: 'b', level: 'fail', summary: 'fail' }
      ])
    ).toBe('down');
  });
});
