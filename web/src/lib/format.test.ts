import { dateBadge, describeLevels, formatDate, formatEventWhen } from './format';

describe('formatEventWhen', () => {
  it('shows one day with a time range in school time (UTC-4)', () => {
    expect(formatEventWhen('2026-10-20T14:00:00.000Z', '2026-10-20T18:00:00.000Z')).toBe(
      'Tue, 20 Oct 2026, 10:00–14:00',
    );
  });

  it('shows both dates for a multi-day event', () => {
    expect(formatEventWhen('2026-10-20T14:00:00.000Z', '2026-10-22T18:00:00.000Z')).toBe(
      'Tue, 20 Oct 2026 – Thu, 22 Oct 2026',
    );
  });

  it('shows only the start when there is no end', () => {
    expect(formatEventWhen('2026-10-20T14:00:00.000Z', null)).toBe('Tue, 20 Oct 2026, 10:00');
  });

  it('uses the school day, not UTC, near midnight', () => {
    // 02:00 UTC on the 21st is still 22:00 on the 20th in UTC-4.
    expect(formatEventWhen('2026-10-21T02:00:00.000Z', null)).toBe('Tue, 20 Oct 2026, 22:00');
  });
});

describe('dates and labels', () => {
  it('builds a calendar badge', () => {
    expect(dateBadge('2026-10-20T14:00:00.000Z')).toEqual({ day: '20', month: 'Oct' });
  });

  it('formats a long date', () => {
    expect(formatDate('2026-10-03T12:00:00.000Z')).toBe('3 October 2026');
  });

  it('describes level coverage', () => {
    expect(describeLevels([])).toBe('Whole school');
    expect(describeLevels(['kindergarten', 'primary', 'secondary'])).toBe('Whole school');
    expect(describeLevels(['kindergarten', 'primary'])).toBe('Kindergarten · Primary');
  });
});
