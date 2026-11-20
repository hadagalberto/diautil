import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  MAX_YEAR,
  MIN_YEAR,
  ashWednesday,
  carnavalMonday,
  carnavalTuesday,
  corpusChristi,
  dayOfWeek,
  easterOffset,
  easterSunday,
  goodFriday,
  isWeekday,
  movableDates,
  plainDate,
  toISO,
} from '../src/index.js';

describe('Easter (Meeus/Jones/Butcher)', () => {
  it.each([
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2030, '2030-04-21'],
    [2038, '2038-04-25'],
    [1961, '1961-04-02'],
    [2100, '2100-03-28'],
  ])('matches the SPEC vector for %s: %s', (year, expected) => {
    expect(toISO(easterSunday(year))).toBe(expected);
    expect(dayOfWeek(easterSunday(year))).toBe(0);
  });

  it.each([
    [2019, '2019-04-21'],
    [2021, '2021-04-04'],
    [2022, '2022-04-17'],
    [2023, '2023-04-09'],
    [2035, '2035-03-25'],
  ])('matches additional hand-checked year %s: %s', (year, expected) => {
    expect(toISO(easterSunday(year))).toBe(expected);
  });

  it('always falls on a Sunday between March 22 and April 25', () => {
    for (let year = MIN_YEAR; year <= MAX_YEAR; year += 1) {
      const easter = easterSunday(year);
      expect(dayOfWeek(easter)).toBe(0);
      expect(easter.month).toBeGreaterThanOrEqual(3);
      expect(easter.month).toBeLessThanOrEqual(4);
      if (easter.month === 3) {
        expect(easter.day).toBeGreaterThanOrEqual(22);
      } else {
        expect(easter.day).toBeLessThanOrEqual(25);
      }
    }
  });

  it('rejects years outside the supported range', () => {
    expect(() => easterSunday(1899)).toThrow(RangeError);
    expect(() => easterSunday(2200)).toThrow(RangeError);
    expect(() => easterOffset(1899, 1)).toThrow(RangeError);
  });

  it('applies offsets relative to Easter via fast-check', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: MIN_YEAR, max: MAX_YEAR }),
        fc.integer({ min: -100, max: 100 }),
        (year, offset) => {
          const easter = easterSunday(year);
          const shifted = easterOffset(year, offset);
          expect(toISO(easterOffset(year, 0))).toBe(toISO(easter));
          expect(dayOfWeek(shifted)).toBe((dayOfWeek(easter) + offset + 700) % 7);
        },
      ),
    );
  });
});

describe('Easter-derived movable dates', () => {
  it('matches the SPEC regression values for 2026', () => {
    expect(toISO(carnavalMonday(2026))).toBe('2026-02-16');
    expect(toISO(carnavalTuesday(2026))).toBe('2026-02-17');
    expect(toISO(ashWednesday(2026))).toBe('2026-02-18');
    expect(toISO(goodFriday(2026))).toBe('2026-04-03');
    expect(toISO(corpusChristi(2026))).toBe('2026-06-04');
  });

  it('exposes the same dates through movableDates()', () => {
    expect(movableDates(2026)).toEqual({
      carnavalMonday: plainDate(2026, 2, 16),
      carnavalTuesday: plainDate(2026, 2, 17),
      ashWednesday: plainDate(2026, 2, 18),
      goodFriday: plainDate(2026, 4, 3),
      corpusChristi: plainDate(2026, 6, 4),
      easter: plainDate(2026, 4, 5),
    });
  });

  it('keeps the canonical offsets on every year', () => {
    for (let year = MIN_YEAR; year <= MAX_YEAR; year += 1) {
      const easter = easterSunday(year);
      const dates = movableDates(year);
      expect(toISO(carnavalMonday(year))).toBe(toISO(easterOffset(year, -48)));
      expect(toISO(carnavalTuesday(year))).toBe(toISO(easterOffset(year, -47)));
      expect(toISO(ashWednesday(year))).toBe(toISO(easterOffset(year, -46)));
      expect(toISO(goodFriday(year))).toBe(toISO(easterOffset(year, -2)));
      expect(toISO(corpusChristi(year))).toBe(toISO(easterOffset(year, 60)));
      expect(dates.easter).toEqual(easter);
      expect(isWeekday(goodFriday(year), 5)).toBe(true);
      expect(isWeekday(corpusChristi(year), 4)).toBe(true);
    }
  });
});
