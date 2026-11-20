import { describe, expect, it } from 'vitest';
import expectedTable from './fixtures/national-2000-2035.json';
import { goodFriday, holidays, isHoliday, nationalRules, toISO } from '../src/index.js';

interface ExpectedEntry {
  readonly data: string;
  readonly nome: string;
  readonly id: string;
}

const table: Record<string, readonly ExpectedEntry[]> = expectedTable;

function actualEntries(year: number): ExpectedEntry[] {
  return holidays(year).map((holiday) => ({
    data: toISO(holiday.date),
    nome: holiday.namePt,
    id: holiday.id,
  }));
}

describe('national expected table 2000-2035', () => {
  it('matches every checked-in year exactly', () => {
    for (let year = 2000; year <= 2035; year += 1) {
      const expected = table[String(year)];
      expect(expected, `missing expected row for ${year}`).toBeDefined();
      expect(actualEntries(year)).toEqual(expected);
    }
  });

  it('has hand-verifiable counts and year-validity transitions', () => {
    expect(actualEntries(2000)).toHaveLength(7);
    expect(actualEntries(2002)).toHaveLength(7);
    expect(actualEntries(2003)).toHaveLength(8);
    expect(actualEntries(2023)).toHaveLength(8);
    expect(actualEntries(2024)).toHaveLength(9);
    expect(actualEntries(2035)).toHaveLength(9);

    // 02/11 became a national holiday with Lei 10.607/2002.
    expect(actualEntries(2002).some((entry) => entry.data === '2002-11-02')).toBe(false);
    expect(actualEntries(2003).some((entry) => entry.data === '2003-11-02')).toBe(true);
    // Lei 6.802/1980 added 12/10.
    expect(holidays(1979).some((holiday) => toISO(holiday.date) === '1979-10-12')).toBe(false);
    expect(holidays(1980).some((holiday) => toISO(holiday.date) === '1980-10-12')).toBe(true);
    // Lei 1.266/1950 art. 3º established 21/04; first occurrence in range is 1951.
    expect(holidays(1950).some((holiday) => toISO(holiday.date) === '1950-04-21')).toBe(false);
    expect(holidays(1951).some((holiday) => toISO(holiday.date) === '1951-04-21')).toBe(true);
  });

  it.each([
    [2024, '2024-01-01', 'new-year'],
    [2024, '2024-04-21', 'tiradentes'],
    [2024, '2024-05-01', 'labour-day'],
    [2024, '2024-09-07', 'independence-day'],
    [2024, '2024-10-12', 'our-lady-of-apparecida'],
    [2024, '2024-11-02', 'all-souls-day'],
    [2024, '2024-11-20', 'black-consciousness-day'],
    [2024, '2024-11-15', 'republic-proclamation-day'],
    [2024, '2024-12-25', 'christmas'],
  ])('has the %s holiday %s with id %s', (year, date, id) => {
    expect(actualEntries(year).find((entry) => entry.id === id)?.data).toBe(date);
  });
});

describe('SPEC regression cases', () => {
  it('20/11/2023 is NOT a national holiday but 20/11/2024 is', () => {
    expect(isHoliday('2023-11-20')).toBe(false);
    expect(isHoliday('2024-11-20')).toBe(true);
  });

  it('2026 movable dates match Carnaval, Ash Wednesday, Good Friday and Corpus Christi', () => {
    const optional = holidays(2026, { include: ['optional'] });
    expect(optional.map((holiday) => toISO(holiday.date))).toEqual([
      '2026-02-16',
      '2026-02-17',
      '2026-02-18',
      '2026-06-04',
    ]);
    expect(toISO(goodFriday(2026))).toBe('2026-04-03');
    expect(isHoliday('2026-02-16')).toBe(false);
    expect(isHoliday('2026-02-16', { include: ['optional'] })).toBe(true);
  });

  it('combines national and optional types when requested', () => {
    expect(holidays(2026, { include: ['national', 'optional'] })).toHaveLength(13);
  });
});

describe('legal sources', () => {
  it('cites a law for every rule', () => {
    expect(nationalRules).toHaveLength(13);
    for (const rule of nationalRules) {
      expect(rule.law.length).toBeGreaterThan(0);
      expect(rule.law).toContain('Lei nº');
      expect(rule.id.length).toBeGreaterThan(0);
      expect(rule.namePt.length).toBeGreaterThan(0);
      expect(rule.nameEn.length).toBeGreaterThan(0);
    }
  });

  it('distinguishes national holidays from ponto facultativo', () => {
    expect(nationalRules.filter((rule) => rule.type === 'national')).toHaveLength(9);
    expect(nationalRules.filter((rule) => rule.type === 'optional')).toHaveLength(4);
    for (const rule of nationalRules.filter((entry) => entry.type === 'optional')) {
      expect(rule.law).toContain('Ponto facultativo');
      expect(rule.law).toContain('não é feriado nacional');
    }
  });

  it('uses the explicit Lei 14.759/2023 citation starting in 2024', () => {
    const zumbi = nationalRules.find((rule) => rule.id === 'black-consciousness-day');
    expect(zumbi).toBeDefined();
    expect(zumbi?.law).toBe('Lei nº 14.759, de 21 de dezembro de 2023');
    expect(zumbi?.since).toBe(2024);
  });
});
