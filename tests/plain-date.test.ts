import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  MAX_YEAR,
  MIN_YEAR,
  addDays,
  compareDates,
  dayOfWeek,
  daysBetween,
  daysInMonth,
  fromISO,
  fromDate,
  isLeapYear,
  isPlainDate,
  isValidPlainDate,
  isValidYear,
  nthWeekdayOfMonth,
  plainDate,
  toDate,
  toISO,
  type PlainDate,
  type Weekday,
} from '../src/index.js';

const TOTAL_DAYS = daysBetween(plainDate(MIN_YEAR, 1, 1), plainDate(MAX_YEAR, 12, 31));
const SERIAL: fc.Arbitrary<number> = fc.integer({ min: 0, max: TOTAL_DAYS });
const ARB_DATE: fc.Arbitrary<PlainDate> = SERIAL.map((days) =>
  addDays(plainDate(MIN_YEAR, 1, 1), days),
);
const fromSerial = (serial: number): PlainDate => addDays(plainDate(MIN_YEAR, 1, 1), serial);

describe('PlainDate construction and validation', () => {
  it('builds valid dates including leap day and range boundaries', () => {
    expect(plainDate(2024, 2, 29)).toEqual({ year: 2024, month: 2, day: 29 });
    expect(plainDate(1900, 1, 1)).toEqual({ year: 1900, month: 1, day: 1 });
    expect(plainDate(2199, 12, 31)).toEqual({ year: 2199, month: 12, day: 31 });
  });

  it.each([
    [1899, 12, 31],
    [2200, 1, 1],
    [2023, 2, 29],
    [1900, 2, 29],
    [2024, 4, 31],
    [2024, 0, 1],
    [2024, 13, 1],
    [2024, 1, 0],
    [2024.5, 1, 1],
    [Number.NaN, 1, 1],
  ])('rejects invalid components %s-%s-%s', (year, month, day) => {
    expect(() => plainDate(year, month, day)).toThrow(RangeError);
    expect(isValidPlainDate(year, month, day)).toBe(false);
  });

  it('guards arbitrary values with isPlainDate and isValidYear', () => {
    expect(isPlainDate(plainDate(2024, 1, 1))).toBe(true);
    expect(isPlainDate({ year: 2024, month: 2, day: 30 })).toBe(false);
    expect(isPlainDate({ year: 2024, month: 1 })).toBe(false);
    expect(isPlainDate(null)).toBe(false);
    expect(isPlainDate('2024-01-01')).toBe(false);
    expect(isValidYear(2000)).toBe(true);
    expect(isValidYear('2000')).toBe(false);
    expect(isValidYear(2200)).toBe(false);
  });

  it('computes leap years with the Gregorian century rule', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(2199)).toBe(false);
    expect(() => isLeapYear(1800)).toThrow(RangeError);
  });

  it('returns month lengths and validates month numbers', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2024, 4)).toBe(30);
    expect(daysInMonth(2024, 12)).toBe(31);
    expect(() => daysInMonth(2024, 0)).toThrow(RangeError);
    expect(() => daysInMonth(1899, 1)).toThrow(RangeError);
  });
});

describe('ISO conversion', () => {
  it('parses and formats strict YYYY-MM-DD', () => {
    expect(fromISO('2024-03-31')).toEqual({ year: 2024, month: 3, day: 31 });
    expect(toISO(plainDate(1961, 4, 2))).toBe('1961-04-02');
  });

  it('parses full ISO datetimes using the configured time zone', () => {
    // 2024-03-31T00:00:00Z is 2024-03-30 21:00 in America/Sao_Paulo (UTC-03,
    // DST abolished in 2019) and 2024-03-31 00:00 in UTC. Both are hand-derived
    // from the UTC offset, not from the library.
    expect(fromISO('2024-03-31T00:00:00Z', 'America/Sao_Paulo')).toEqual({
      year: 2024,
      month: 3,
      day: 30,
    });
    expect(fromISO('2024-03-31T00:00:00Z', 'UTC')).toEqual({ year: 2024, month: 3, day: 31 });
    // An offset-less datetime is wall-clock time in the configured zone.
    expect(fromISO('2026-11-20T10:00:00')).toEqual({ year: 2026, month: 11, day: 20 });
  });

  it.each([
    '2024-3-31',
    '2024/03/31',
    // '2024-03-31T00:00:00Z' was previously listed here. That assertion encoded
    // the reviewed bug: full ISO datetimes must be accepted (review finding,
    // "ISO parser rejects strings with time"), so it moved to the accept test
    // below with a hand-derived expected value.
    '1899-01-01',
    '2200-01-01',
    '2024-02-30',
    '',
  ])('rejects malformed ISO value %s', (iso) => {
    expect(() => fromISO(iso)).toThrow(RangeError);
  });

  it('round-trips every day in the supported range via fast-check', () => {
    fc.assert(
      fc.property(ARB_DATE, (date) => {
        expect(fromISO(toISO(date))).toEqual(date);
      }),
    );
  });
});

describe('Date boundary conversion', () => {
  it('interprets Date in America/Sao_Paulo by default', () => {
    expect(fromDate(new Date('2024-01-01T02:00:00Z'))).toEqual({ year: 2023, month: 12, day: 31 });
    expect(fromDate(new Date('2024-01-01T03:00:00Z'))).toEqual({ year: 2024, month: 1, day: 1 });
    // DST was abolished in Brazil in 2019: from 2019 onward the offset is -03.
    expect(fromDate(new Date('2026-11-20T02:00:00Z'))).toEqual({ year: 2026, month: 11, day: 19 });
    expect(fromDate(new Date('2026-11-20T03:00:00Z'))).toEqual({ year: 2026, month: 11, day: 20 });
  });

  it('accepts a configurable time zone at the boundary', () => {
    expect(fromDate(new Date('2024-01-01T02:00:00Z'), 'UTC')).toEqual({
      year: 2024,
      month: 1,
      day: 1,
    });
    expect(fromDate(new Date('2024-01-01T02:00:00Z'), 'America/New_York')).toEqual({
      year: 2023,
      month: 12,
      day: 31,
    });
  });

  it('rejects invalid Date objects and unknown zones', () => {
    expect(() => fromDate(new Date(Number.NaN))).toThrow(RangeError);
    expect(() => fromDate(new Date('2024-01-01T00:00:00Z'), 'Mars/Olympus')).toThrow(RangeError);
    expect(() => toDate(plainDate(2024, 1, 1), 'Mars/Olympus')).toThrow(RangeError);
  });

  it.each(['America/Sao_Paulo', 'UTC', 'America/New_York', 'Australia/Sydney'])(
    'round-trips plain dates through %s (incl. DST and leap day)',
    (timeZone) => {
      const samples = [
        plainDate(1900, 1, 1),
        plainDate(2018, 10, 21),
        plainDate(2018, 11, 4),
        plainDate(2024, 2, 29),
        plainDate(2024, 3, 31),
        plainDate(2026, 11, 20),
        plainDate(2199, 12, 31),
      ];
      for (const date of samples) {
        expect(fromDate(toDate(date, timeZone), timeZone)).toEqual(date);
      }
    },
  );
});

describe('date arithmetic', () => {
  it('adds and subtracts days across month, year and leap boundaries', () => {
    expect(addDays(plainDate(2024, 2, 28), 1)).toEqual({ year: 2024, month: 2, day: 29 });
    expect(addDays(plainDate(2024, 2, 29), 1)).toEqual({ year: 2024, month: 3, day: 1 });
    expect(addDays(plainDate(2024, 1, 1), -1)).toEqual({ year: 2023, month: 12, day: 31 });
    expect(addDays(plainDate(2024, 12, 31), 1)).toEqual({ year: 2025, month: 1, day: 1 });
  });

  it('rejects non-integer offsets and results outside the supported range', () => {
    expect(() => addDays(plainDate(2024, 1, 1), 1.5)).toThrow(RangeError);
    expect(() => addDays(plainDate(1900, 1, 1), -1)).toThrow(RangeError);
    expect(() => addDays(plainDate(2199, 12, 31), 1)).toThrow(RangeError);
  });

  it('computes signed distances and comparisons', () => {
    const a = plainDate(2024, 3, 31);
    const b = plainDate(2024, 4, 1);
    expect(daysBetween(a, b)).toBe(1);
    expect(daysBetween(b, a)).toBe(-1);
    expect(daysBetween(a, a)).toBe(0);
    expect(compareDates(a, b)).toBe(-1);
    expect(compareDates(b, a)).toBe(1);
    expect(compareDates(a, a)).toBe(0);
    expect(daysBetween(plainDate(2000, 1, 1), plainDate(2100, 1, 1))).toBe(36_525);
  });

  it('keeps arithmetic consistent under fast-check', () => {
    fc.assert(
      fc.property(SERIAL, SERIAL, (from, to) => {
        const date = fromSerial(from);
        const offset = to - from;
        const moved = addDays(date, offset);
        expect(daysBetween(date, moved)).toBe(offset);
        expect(addDays(moved, -offset)).toEqual(date);
      }),
    );
    fc.assert(
      fc.property(ARB_DATE, ARB_DATE, (a, b) => {
        expect(daysBetween(a, b) + daysBetween(b, a)).toBe(0);
        const sign = compareDates(a, b);
        expect(sign).toBe(Math.sign(daysBetween(b, a)));
      }),
    );
  });
});

describe('weekday arithmetic', () => {
  it('computes known weekdays (0 = Sunday)', () => {
    expect(dayOfWeek(plainDate(2024, 3, 31))).toBe(0);
    expect(dayOfWeek(plainDate(2024, 1, 1))).toBe(1);
    expect(dayOfWeek(plainDate(2000, 1, 1))).toBe(6);
    expect(dayOfWeek(plainDate(1961, 4, 2))).toBe(0);
    expect(dayOfWeek(plainDate(2026, 11, 20))).toBe(5);
  });

  it('repeats every 7 days over the whole range via fast-check', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: TOTAL_DAYS - 365 }),
        fc.integer({ min: 0, max: 52 }),
        (serial, weeks) => {
          const date = fromSerial(serial);
          const shifted = addDays(date, weeks * 7);
          expect(dayOfWeek(shifted)).toBe(dayOfWeek(date));
        },
      ),
    );
  });

  it('finds nth weekdays from the start and from the end', () => {
    expect(nthWeekdayOfMonth(2024, 2, 1, 1)).toEqual({ year: 2024, month: 2, day: 5 });
    expect(nthWeekdayOfMonth(2024, 2, 1, 4)).toEqual({ year: 2024, month: 2, day: 26 });
    expect(nthWeekdayOfMonth(2024, 2, 1, -1)).toEqual({ year: 2024, month: 2, day: 26 });
    expect(nthWeekdayOfMonth(2024, 2, 0, -1)).toEqual({ year: 2024, month: 2, day: 25 });
    expect(nthWeekdayOfMonth(2024, 2, 2, 2)).toEqual({ year: 2024, month: 2, day: 13 });
    expect(nthWeekdayOfMonth(2024, 2, 4, 1)).toEqual({ year: 2024, month: 2, day: 1 });
  });

  it('rejects invalid nth values and non-existent occurrences', () => {
    expect(() => nthWeekdayOfMonth(2024, 2, 1, 0)).toThrow(RangeError);
    expect(() => nthWeekdayOfMonth(2024, 2, 1, 6)).toThrow(RangeError);
    expect(() => nthWeekdayOfMonth(2024, 2, 1, -6)).toThrow(RangeError);
    expect(() => nthWeekdayOfMonth(2024, 2, 1, 5)).toThrow(RangeError);
    expect(() => nthWeekdayOfMonth(1899, 2, 1, 1)).toThrow(RangeError);
  });

  it('always returns a date with the requested weekday via fast-check', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: MIN_YEAR, max: MAX_YEAR }),
        fc.integer({ min: 1, max: 12 }),
        fc.constantFrom<Weekday>(0, 1, 2, 3, 4, 5, 6),
        (year, month, weekday) => {
          const found = nthWeekdayOfMonth(year, month, weekday, 1);
          expect(found.month).toBe(month);
          expect(found.year).toBe(year);
          expect(dayOfWeek(found)).toBe(weekday);
          expect(found.day).toBeLessThanOrEqual(7);
        },
      ),
    );
  });
});
