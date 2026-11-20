/**
 * Regression tests for the independent-review findings (milestone 6).
 *
 * Every expected value here is derived by hand from the SPEC, an official
 * source, or arithmetic written in the comment — never from the library under
 * test. Run these against the pre-fix code to confirm they reproduce each bug.
 */
import { describe, expect, it } from 'vitest';
import {
  createCalendar,
  findHolidays,
  fromISO,
  holidayName,
  holidays,
  isBusinessDay,
  isHoliday,
  nextHoliday,
  plainDate,
  rulesForOptions,
  stateRulesByUF,
  toISO,
  toPlainDate,
} from '../src/index.js';

describe('review finding: UF/city scope consistency', () => {
  it('rejects a capital that belongs to a different UF', () => {
    // src/holidays/geo.ts maps São Paulo -> SP and Rio de Janeiro -> RJ.
    // Accepting {uf:'RJ', city:'São Paulo'} silently mixed RJ state rules with
    // SP municipal rules, which no real calendar does.
    expect(() => holidays(2026, { uf: 'RJ', city: 'São Paulo' })).toThrow(RangeError);
    expect(() => holidays(2026, { uf: 'SP', city: 'Rio de Janeiro' })).toThrow(RangeError);
    expect(() => isHoliday('2026-07-09', { uf: 'RJ', city: 'São Paulo' })).toThrow(RangeError);
    expect(() => rulesForOptions({ uf: 'RJ', city: 'São Paulo' })).toThrow(RangeError);
    expect(() => createCalendar({ uf: 'RJ', city: 'São Paulo' })).toThrow(RangeError);
  });

  it('accepts matching scopes with accents, case and whitespace variants', () => {
    // cityKey() is NFD-unaccented, lowercased and trimmed, so all of these
    // resolve to the canonical capital 'São Paulo' and therefore to UF SP.
    for (const city of ['São Paulo', 'sao paulo', 'SAO PAULO', ' São Paulo ']) {
      expect(() => holidays(2026, { uf: 'SP', city })).not.toThrow();
    }
    expect(() => holidays(2026, { uf: 'RJ', city: 'rio de janeiro' })).not.toThrow();
  });
});

describe('review finding: timeZone at the API boundary', () => {
  // Brazil abolished DST in 2019: America/Sao_Paulo is UTC-03 all year.
  // 2024-11-20T02:00:00Z is therefore 19/11 23:00 in São Paulo but 20/11 02:00
  // in UTC. 20/11 is Zumbi, a national holiday from 2024 (Lei 14.759/2023).
  const zumbiInstant = new Date('2024-11-20T02:00:00Z');

  it('uses HolidayOptions.timeZone for Date inputs in the holiday API', () => {
    expect(isHoliday(zumbiInstant)).toBe(false);
    expect(isHoliday(zumbiInstant, { timeZone: 'UTC' })).toBe(true);
    expect(holidayName(zumbiInstant, { timeZone: 'UTC' })).toBe(
      'Dia Nacional de Zumbi e da Consciência Negra',
    );
    expect(findHolidays(zumbiInstant, { timeZone: 'UTC' }).map((holiday) => holiday.id)).toContain(
      'black-consciousness-day',
    );
    // The next national holiday strictly after 20/11/2024 is Christmas 25/12.
    expect(
      toISO(nextHoliday(zumbiInstant, { timeZone: 'UTC' })?.date ?? plainDate(1900, 1, 1)),
    ).toBe('2024-12-25');
  });

  it('validates the configured IANA zone for every options-taking API', () => {
    // An unknown zone must fail at the boundary, not be silently ignored.
    expect(() => holidays(2026, { timeZone: 'Mars/Olympus' })).toThrow(RangeError);
    expect(() => isHoliday('2026-11-20', { timeZone: 'Mars/Olympus' })).toThrow(RangeError);
    expect(() => createCalendar({ timeZone: 'Mars/Olympus' })).toThrow(RangeError);
  });

  it('uses the calendar timeZone for Date inputs in business arithmetic', () => {
    // 2026-11-20T02:00:00Z = 19/11 23:00 in São Paulo (ordinary Thursday) and
    // 20/11 02:00 in UTC (Zumbi, a national holiday since 2024).
    const instant2026 = new Date('2026-11-20T02:00:00Z');
    expect(isBusinessDay(instant2026)).toBe(true);
    expect(isBusinessDay(instant2026, { timeZone: 'UTC' })).toBe(false);
    expect(createCalendar({ timeZone: 'UTC' })).not.toBe(createCalendar());
  });
});

describe('review finding: full ISO datetimes', () => {
  it('accepts offset-less ISO datetimes as wall-clock dates in the configured zone', () => {
    // A wall-clock time has the same calendar date in every zone; the time is
    // validated but does not shift the date.
    expect(fromISO('2026-11-20T10:00:00')).toEqual(plainDate(2026, 11, 20));
    expect(fromISO('2026-11-20T10:00')).toEqual(plainDate(2026, 11, 20));
    expect(toPlainDate('2026-11-20T10:00:00')).toEqual(plainDate(2026, 11, 20));
  });

  it('converts ISO datetimes with an explicit offset into the configured zone', () => {
    // 2024-03-31T00:00:00Z is 2024-03-30 21:00 in São Paulo (UTC-03 after 2019)
    // and 2024-03-31 00:00 in UTC.
    expect(fromISO('2024-03-31T00:00:00Z', 'America/Sao_Paulo')).toEqual(plainDate(2024, 3, 30));
    expect(fromISO('2024-03-31T00:00:00Z', 'UTC')).toEqual(plainDate(2024, 3, 31));
    // 2026-11-19T23:30:00-03:00 = 2026-11-20T02:30Z -> 20/11 in UTC.
    expect(fromISO('2026-11-19T23:30:00-03:00', 'UTC')).toEqual(plainDate(2026, 11, 20));
    // Zumbi is a national holiday from 2024 (Lei 14.759/2023).
    expect(isHoliday('2024-11-20T02:00:00Z', { timeZone: 'UTC' })).toBe(true);
    expect(isHoliday('2024-11-20T02:00:00Z')).toBe(false);
  });

  it('rejects ISO datetimes with out-of-range time fields', () => {
    expect(() => fromISO('2026-11-20T25:00:00')).toThrow(RangeError);
    expect(() => fromISO('2026-11-20T10:60:00')).toThrow(RangeError);
    expect(() => fromISO('2026-11-20T10:00:60')).toThrow(RangeError);
    expect(() => fromISO('2026-11-20 10:00:00')).toThrow(RangeError);
  });
});

describe('review finding: RJ Corpus Christi law verification', () => {
  it('keeps the verifiable Alerj citation and its 2025 validity boundary', () => {
    // Verified 2026-11-20 on the official Alerj "Texto da Lei" page:
    // LEI Nº 11.002 DE 22 DE OUTUBRO DE 2025, "Em Vigor com alterações",
    // D.O nº 196, ADI 7898 julgada improcedente (STF incidente 7434201).
    // The law institutes Corpus Christi as a state holiday on the first
    // Thursday after 60 days from Easter Sunday = Easter + 60 days.
    const rule = stateRulesByUF.RJ.find((entry) => entry.id === 'rj-corpus-christi');
    expect(rule).toBeDefined();
    expect(rule?.law).toBe('Lei nº 11.002, de 22 de outubro de 2025');
    expect(rule?.since).toBe(2025);
    expect(rule?.source).toContain('alerj.rj.gov.br');
    expect(
      holidays(2024, { uf: 'RJ', include: ['state'] }).some(
        (holiday) => holiday.id === 'rj-corpus-christi',
      ),
    ).toBe(false);
    expect(
      holidays(2025, { uf: 'RJ', include: ['state'] }).some(
        (holiday) => holiday.id === 'rj-corpus-christi',
      ),
    ).toBe(true);
  });
});
