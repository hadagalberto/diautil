import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import { businessDaysBetween, createCalendar } from '../src/index.js';

describe('per-year cache performance', () => {
  it('counts business days across 100 years in under 5 ms with warm caches', () => {
    // Warm the shared calendar's per-year cache first; that cache is the point
    // of the requirement (repeated queries must not walk every calendar day).
    const expected = businessDaysBetween('2000-01-01', '2100-01-01');
    const started = performance.now();
    const count = businessDaysBetween('2000-01-01', '2100-01-01');
    const elapsed = performance.now() - started;
    expect(count).toBe(expected);
    expect(elapsed).toBeLessThan(5);
  });

  it('builds a cold, independently configured 100-year calendar quickly', () => {
    // A distinct weekend configuration forces a fresh cache, exercising the
    // one-time per-year index construction without per-day counting in queries.
    const calendar = createCalendar({ weekends: [0, 6, 1] });
    const started = performance.now();
    const count = calendar.businessDaysBetween('2000-01-01', '2100-01-01');
    const elapsed = performance.now() - started;
    expect(count).toBeGreaterThan(18_000); // three weekend days per week
    expect(count).toBeLessThan(22_000);
    expect(elapsed).toBeLessThan(100);
  });
});
