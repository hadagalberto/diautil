import { describe, expect, it } from 'vitest';
import {
  addBusinessDays,
  businessDaysBetween,
  createCalendar,
  isBusinessDay,
  lastBusinessDayOfMonth,
  nextBusinessDay,
  nthBusinessDayOfMonth,
  plainDate,
  previousBusinessDay,
  toISO,
} from '../src/index.js';

describe('isBusinessDay', () => {
  it('rejects weekends and national holidays with known-valid vectors', () => {
    // 2026-11-19 is a Thursday; 20/11 is Zumbi (Lei 14.759/2023); 21/22 are the weekend.
    expect(isBusinessDay('2026-11-19')).toBe(true);
    expect(isBusinessDay('2026-11-20')).toBe(false);
    expect(isBusinessDay('2026-11-21')).toBe(false);
    expect(isBusinessDay('2026-11-22')).toBe(false);
    expect(isBusinessDay('2026-11-23')).toBe(true);
    expect(isBusinessDay('2026-12-25')).toBe(false);
  });

  it('treats ponto facultativo dates as business days in the civil calendar', () => {
    expect(isBusinessDay('2026-02-16')).toBe(true); // Carnaval Monday
    expect(isBusinessDay('2026-02-17')).toBe(true); // Carnaval Tuesday
    expect(isBusinessDay('2026-06-04')).toBe(true); // Corpus Christi
  });

  it('accepts PlainDate and Date inputs', () => {
    expect(isBusinessDay(plainDate(2026, 11, 19))).toBe(true);
    expect(isBusinessDay(new Date('2026-11-19T12:00:00Z'))).toBe(true);
    expect(isBusinessDay(new Date('2026-11-20T12:00:00Z'))).toBe(false);
  });
});

describe('addBusinessDays', () => {
  it('skips weekends and holidays in both directions', () => {
    expect(toISO(addBusinessDays('2026-11-19', 1))).toBe('2026-11-23');
    expect(toISO(addBusinessDays('2026-11-23', -1))).toBe('2026-11-19');
    expect(toISO(addBusinessDays('2026-12-24', 1))).toBe('2026-12-28');
    expect(toISO(addBusinessDays('2026-12-28', -1))).toBe('2026-12-24');
    expect(toISO(addBusinessDays('2026-01-01', 1))).toBe('2026-01-02');
    expect(toISO(addBusinessDays('2026-11-19', 0))).toBe('2026-11-19');
  });

  it('rolls non-business dates forward or backward when n is zero', () => {
    expect(toISO(addBusinessDays('2026-11-21', 0))).toBe('2026-11-23');
    expect(toISO(addBusinessDays('2026-11-21', 0, { roll: 'forward' }))).toBe('2026-11-23');
    expect(toISO(addBusinessDays('2026-11-21', 0, { roll: 'backward' }))).toBe('2026-11-19');
    expect(toISO(addBusinessDays('2026-11-20', 0, { roll: 'backward' }))).toBe('2026-11-19');
  });

  it('rejects non-integer offsets and out-of-range walks', () => {
    expect(() => addBusinessDays('2026-11-19', 1.5)).toThrow(RangeError);
    expect(() => addBusinessDays('1900-01-01', -1)).toThrow(RangeError);
    expect(() => addBusinessDays('2199-12-31', 1)).toThrow(RangeError);
    expect(() => nextBusinessDay('2199-12-31')).toThrow(RangeError);
    expect(() => previousBusinessDay('1900-01-01')).toThrow(RangeError);
  });
});

describe('nextBusinessDay and previousBusinessDay', () => {
  it('move strictly past the input date', () => {
    expect(toISO(nextBusinessDay('2026-11-19'))).toBe('2026-11-23');
    expect(toISO(previousBusinessDay('2026-11-23'))).toBe('2026-11-19');
    expect(toISO(nextBusinessDay('2026-12-24'))).toBe('2026-12-28');
    expect(toISO(previousBusinessDay('2026-12-28'))).toBe('2026-12-24');
  });
});

describe('businessDaysBetween', () => {
  it('counts the open interval by default and is signed', () => {
    expect(businessDaysBetween('2026-11-19', '2026-11-23')).toBe(0); // 20 holiday; 21/22 weekend
    expect(businessDaysBetween('2026-11-19', '2026-11-25')).toBe(2); // 23 and 24
    expect(businessDaysBetween('2026-11-25', '2026-11-19')).toBe(-2);
    expect(businessDaysBetween('2026-11-23', '2026-11-23')).toBe(0);
  });

  it('counts both endpoints when inclusive is true', () => {
    expect(businessDaysBetween('2026-11-19', '2026-11-23', { inclusive: true })).toBe(2);
    expect(businessDaysBetween('2026-11-19', '2026-11-19', { inclusive: true })).toBe(1);
    expect(businessDaysBetween('2026-11-20', '2026-11-20', { inclusive: true })).toBe(0);
    expect(businessDaysBetween('2026-11-23', '2026-11-19', { inclusive: true })).toBe(-2);
  });

  it('uses per-year caches across multi-year ranges', () => {
    const count = businessDaysBetween('2000-01-01', '2100-01-01');
    expect(count).toBeGreaterThan(25_000);
    expect(count).toBeLessThan(27_000);
    expect(businessDaysBetween('2100-01-01', '2000-01-01')).toBe(-count);
  });

  it('rejects malformed endpoint strings', () => {
    expect(() => businessDaysBetween('2026-13-01', '2026-11-19')).toThrow(RangeError);
    expect(() => businessDaysBetween('2026-11-19', 'not-a-date')).toThrow(RangeError);
  });
});

describe('month helpers', () => {
  it('finds the last business day of a month', () => {
    expect(toISO(lastBusinessDayOfMonth(2026, 12))).toBe('2026-12-31');
    expect(toISO(lastBusinessDayOfMonth(2026, 11))).toBe('2026-11-30');
    // 30/09/2026 is a Wednesday and 01/10 is a national holiday.
    expect(toISO(lastBusinessDayOfMonth(2026, 9))).toBe('2026-09-30');
  });

  it('finds nth business days, including the CLT art. 459 salary date', () => {
    expect(toISO(nthBusinessDayOfMonth(2026, 12, 5))).toBe('2026-12-07');
    expect(toISO(nthBusinessDayOfMonth(2026, 1, 1))).toBe('2026-01-02'); // 01/01 is a holiday
    expect(toISO(nthBusinessDayOfMonth(2026, 12, -1))).toBe('2026-12-31');
    expect(toISO(nthBusinessDayOfMonth(2026, 11, -2))).toBe('2026-11-27');
  });

  it('rejects invalid month and nth arguments', () => {
    expect(() => nthBusinessDayOfMonth(2026, 12, 0)).toThrow(RangeError);
    expect(() => nthBusinessDayOfMonth(2026, 12, 1.5)).toThrow(RangeError);
    expect(() => nthBusinessDayOfMonth(2026, 13, 1)).toThrow(RangeError);
    expect(() => nthBusinessDayOfMonth(2026, 12, 99)).toThrow(RangeError);
    expect(() => lastBusinessDayOfMonth(1899, 1)).toThrow(RangeError);
  });
});

describe('configurable weekends', () => {
  it('honours a custom weekend set', () => {
    expect(isBusinessDay('2026-11-23', { weekends: [1] })).toBe(false); // Monday-only weekend
    expect(isBusinessDay('2026-11-21', { weekends: [1] })).toBe(true); // Saturday is a workday
    expect(toISO(addBusinessDays('2026-11-20', 1, { weekends: [1] }))).toBe('2026-11-21');
    expect(createCalendar({ weekends: [] }).isBusinessDay('2026-11-21')).toBe(true);
  });

  it('rejects out-of-range weekdays and unknown calendars', () => {
    expect(() => createCalendar({ weekends: [7 as 0] })).toThrow(RangeError);
    expect(() => createCalendar({ calendar: 'x' as 'civil' })).toThrow(RangeError);
    expect(() => createCalendar({ uf: 'XX' as 'SP' })).toThrow(RangeError);
    expect(() => createCalendar({ city: 'Nowhere' })).toThrow(RangeError);
  });
});
