import { describe, expect, it } from 'vitest';
import {
  UF_LIST,
  holidayName,
  holidays,
  isHoliday,
  nextHoliday,
  stateRulesByUF,
  toISO,
  type UF,
} from '../src/index.js';

/** Canonical legal dates for 2026 (Easter = 2026-04-05). */
const EXPECTED_2026: Readonly<Record<UF, readonly string[]>> = {
  AC: ['2026-01-20', '2026-01-23', '2026-03-08', '2026-06-15', '2026-09-05', '2026-11-17'],
  AL: ['2026-06-24', '2026-06-29', '2026-09-16', '2026-11-30'],
  AM: ['2026-09-05'],
  AP: ['2026-03-19', '2026-09-13'],
  BA: ['2026-07-02'],
  CE: ['2026-03-25'],
  DF: ['2026-04-03', '2026-04-21', '2026-06-04', '2026-10-12', '2026-11-30'],
  ES: ['2026-04-13'],
  GO: ['2026-07-26', '2026-10-24'],
  MA: ['2026-06-04', '2026-07-28'],
  MG: [],
  MS: ['2026-10-11'],
  MT: ['2026-11-20'],
  PA: ['2026-08-15'],
  PB: ['2026-08-05'],
  PE: ['2026-03-06'],
  PI: ['2026-10-19'],
  PR: [],
  RJ: ['2026-02-17', '2026-04-23', '2026-06-04', '2026-11-20'],
  RN: ['2026-10-03'],
  RO: ['2026-01-04', '2026-06-18'],
  RR: ['2026-10-05'],
  RS: ['2026-09-20'],
  SC: ['2026-08-11', '2026-11-25'],
  SE: ['2026-07-08'],
  SP: ['2026-07-09'],
  TO: ['2026-08-15', '2026-09-08', '2026-10-05'],
};

describe('state holidays — one verified vector per UF', () => {
  it.each(UF_LIST)('%s resolves to its exact 2026 legal dates', (uf) => {
    const actual = holidays(2026, { uf, include: ['state'] }).map((holiday) => toISO(holiday.date));
    expect(actual).toEqual(EXPECTED_2026[uf]);
  });

  it.each(UF_LIST)('%s rules carry a real citation, URL and scope', (uf) => {
    for (const rule of stateRulesByUF[uf]) {
      expect(rule.type).toBe('state');
      expect(rule.uf).toBe(uf);
      expect(rule.id).toMatch(/^[a-z]{2}-/);
      expect(rule.namePt.length).toBeGreaterThan(0);
      expect(rule.nameEn.length).toBeGreaterThan(0);
      expect(rule.law).toMatch(/Lei|Decreto|Constituição|Emenda/);
      expect(rule.source).toMatch(/^https?:\/\//);
    }
  });

  it.each(UF_LIST.filter((uf) => EXPECTED_2026[uf].length > 0))(
    '%s marks each of its holidays with isHoliday',
    (uf) => {
      const nationalDates = new Set(holidays(2026).map((holiday) => toISO(holiday.date)));
      for (const iso of EXPECTED_2026[uf]) {
        expect(isHoliday(iso, { uf })).toBe(true);
        // A scoped date appears in the default calendar only when it is also national.
        expect(isHoliday(iso)).toBe(nationalDates.has(iso));
      }
    },
  );

  it('documents the two UFs with no dedicated state holiday', () => {
    expect(stateRulesByUF.MG).toEqual([]);
    expect(stateRulesByUF.PR).toEqual([]);
    expect(holidays(2026, { uf: 'MG', include: ['state'] })).toEqual([]);
    expect(holidays(2026, { uf: 'PR', include: ['state'] })).toEqual([]);
  });
});

describe('state holiday API with uf filter', () => {
  it('combines national and selected state rules but never other states', () => {
    const sp = holidays(2026, { uf: 'SP' });
    expect(sp).toHaveLength(10); // 9 nacionais + Revolução Constitucionalista
    expect(sp.map((holiday) => toISO(holiday.date))).toContain('2026-07-09');
    expect(sp.map((holiday) => toISO(holiday.date))).not.toContain('2026-04-23');
    expect(holidays(2026, { uf: 'RJ' }).map((holiday) => holiday.id)).toContain('rj-sao-jorge');
  });

  it('returns pt-BR and en names for a state holiday', () => {
    expect(holidayName('2026-04-23', { uf: 'RJ' })).toBe('Dia de São Jorge');
    expect(holidayName('2026-04-23', { uf: 'RJ' }, 'en')).toBe('Saint George Day');
    expect(holidayName('2026-04-23')).toBeUndefined();
  });

  it('finds the next state holiday strictly after the input date', () => {
    const found = nextHoliday('2026-07-08', { uf: 'SP' });
    expect(found?.id).toBe('sp-revolucao-constitucionalista');
    expect(toISO(found?.date ?? { year: 1900, month: 1, day: 1 })).toBe('2026-07-09');
  });

  it('honours law-validity transitions', () => {
    const hasStateDate = (year: number, uf: UF, iso: string): boolean =>
      holidays(year, { uf, include: ['state'] }).some((holiday) => toISO(holiday.date) === iso);

    expect(hasStateDate(1996, 'SP', '1996-07-09')).toBe(false);
    expect(hasStateDate(1997, 'SP', '1997-07-09')).toBe(true);
    expect(hasStateDate(2018, 'ES', '2018-04-09')).toBe(false);
    expect(hasStateDate(2019, 'ES', '2019-04-29')).toBe(true);
    expect(hasStateDate(2024, 'RJ', '2024-05-30')).toBe(false);
    expect(hasStateDate(2025, 'RJ', '2025-06-19')).toBe(true);
    expect(hasStateDate(2020, 'MA', '2020-06-11')).toBe(false);
    expect(hasStateDate(2021, 'MA', '2021-06-03')).toBe(true);
    expect(hasStateDate(2002, 'MT', '2002-11-20')).toBe(false);
    expect(hasStateDate(2003, 'MT', '2003-11-20')).toBe(true);
  });
});
