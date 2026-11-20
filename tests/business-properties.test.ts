import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  addBusinessDays,
  addDays,
  businessDaysBetween,
  compareDates,
  daysInMonth,
  isBusinessDay,
  nextBusinessDay,
  nthBusinessDayOfMonth,
  plainDate,
  toISO,
  type PlainDate,
} from '../src/index.js';

const ARB_YEAR = fc.integer({ min: 2000, max: 2100 });
const ARB_MONTH = fc.integer({ min: 1, max: 12 });
const ARB_OFFSET = fc.integer({ min: 0, max: 3_650 });

function dateAtOffset(offset: number): PlainDate {
  return addDays(plainDate(2000, 1, 1), offset);
}

function toBusinessDay(date: PlainDate): PlainDate {
  return isBusinessDay(date) ? date : nextBusinessDay(date);
}

/** Straightforward day-by-day reference, independent of the cached year index. */
function bruteBusinessDaysBetween(a: PlainDate, b: PlainDate, inclusive: boolean): number {
  const order = compareDates(a, b);
  if (order === 0) {
    return inclusive && isBusinessDay(a) ? 1 : 0;
  }
  const low = order < 0 ? a : b;
  const high = order < 0 ? b : a;
  let count = 0;
  for (let current = low; compareDates(current, high) <= 0; current = addDays(current, 1)) {
    if (!isBusinessDay(current)) {
      continue;
    }
    if (!inclusive && (compareDates(current, low) === 0 || compareDates(current, high) === 0)) {
      continue;
    }
    count += 1;
  }
  if (count === 0) {
    return 0;
  }
  return order < 0 ? count : -count;
}

describe('business-day properties (SPEC)', () => {
  it('a multi-year span equals the sum of its single-year counts', () => {
    let sum = 0;
    for (let year = 2000; year <= 2099; year += 1) {
      sum += businessDaysBetween(`${year}-01-01`, `${year}-12-31`, { inclusive: true });
    }
    expect(businessDaysBetween('2000-01-01', '2099-12-31', { inclusive: true })).toBe(sum);
  });

  it('round-trips addBusinessDays(d, n) followed by addBusinessDays(., -n)', () => {
    fc.assert(
      fc.property(
        ARB_YEAR,
        ARB_MONTH,
        fc.integer({ min: 1, max: 28 }),
        fc.integer({ min: -150, max: 150 }),
        (year, month, day, n) => {
          const start = toBusinessDay(plainDate(year, month, day));
          const moved = addBusinessDays(start, n);
          expect(isBusinessDay(moved)).toBe(true);
          expect(addBusinessDays(moved, -n)).toEqual(start);
        },
      ),
      { numRuns: 120 },
    );
  });

  it('keeps businessDaysBetween consistent with addBusinessDays', () => {
    fc.assert(
      fc.property(
        ARB_YEAR,
        ARB_MONTH,
        fc.integer({ min: 1, max: 28 }),
        fc.integer({ min: 1, max: 180 }),
        (year, month, day, n) => {
          const start = toBusinessDay(plainDate(year, month, day));
          const end = addBusinessDays(start, n);
          expect(businessDaysBetween(start, end)).toBe(n - 1);
          expect(businessDaysBetween(start, end, { inclusive: true })).toBe(n + 1);
          expect(addBusinessDays(start, businessDaysBetween(start, end) + 1)).toEqual(end);
          expect(businessDaysBetween(end, start)).toBe(n === 1 ? 0 : -(n - 1));
        },
      ),
      { numRuns: 120 },
    );
  });

  it('matches the day-by-day reference for arbitrary endpoints and inclusivity', () => {
    fc.assert(
      fc.property(ARB_OFFSET, ARB_OFFSET, fc.boolean(), (first, second, inclusive) => {
        const a = dateAtOffset(first);
        const b = dateAtOffset(second);
        expect(businessDaysBetween(a, b, { inclusive })).toBe(
          bruteBusinessDaysBetween(a, b, inclusive),
        );
      }),
      { numRuns: 120 },
    );
  });

  it('computes nth and last business days by counting the month', () => {
    fc.assert(
      fc.property(ARB_YEAR, ARB_MONTH, fc.integer({ min: 1, max: 5 }), (year, month, nth) => {
        const last = daysInMonth(year, month);
        let seen = 0;
        let expected: PlainDate | undefined;
        for (let day = 1; day <= last; day += 1) {
          const candidate = plainDate(year, month, day);
          if (isBusinessDay(candidate)) {
            seen += 1;
            if (seen === nth) {
              expected = candidate;
              break;
            }
          }
        }
        const result = nthBusinessDayOfMonth(year, month, nth);
        expect(toISO(result)).toBe(toISO(expected ?? plainDate(year, month, last)));
        expect(isBusinessDay(result)).toBe(true);
        // The last business day equals the last day rolled backwards.
        const rolled = addBusinessDays(plainDate(year, month, last), 0, { roll: 'backward' });
        expect(isBusinessDay(rolled)).toBe(true);
        expect(toISO(rolled)).toBe(toISO(nthBusinessDayOfMonth(year, month, -1)));
      }),
      { numRuns: 120 },
    );
  });
});
