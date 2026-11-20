import { describe, expect, it } from 'vitest';
import { goodFriday, holidays, isHoliday, nationalRules, toISO } from '../src/index.js';

/**
 * INDEPENDENT ORACLE — no expected value in this file comes from `dist` or from
 * a generator that imports diautil. The old
 * `scripts/generate-expected-table.mjs` + `tests/fixtures/national-2000-2035.json`
 * pair was circular: it asked the library what the library should return.
 *
 * Sources for the hand-written expectations below:
 * - Fixed dates and their first valid year: Lei 662/1949 art. 1º (redação Lei
 *   10.607/2002), Lei 1.266/1950 art. 3º, Lei 6.802/1980, Lei 14.759/2023.
 *   The same texts are cited in SPEC.md and in src/holidays/national.ts.
 * - Easter: Gauss's Easter algorithm (a genuinely different computation from
 *   the library's Meeus/Jones/Butcher). The compact Gauss form used here is
 *   valid through 2099, so it is applied to the 2000-2035 range required by
 *   SPEC.md. It reproduces the SPEC vectors (2024-03-31, 2025-04-20,
 *   2026-04-05, 2027-03-28, 2030-04-21, 2038-04-25, 1961-04-02, 2100-03-28).
 * - Movable 2024-2033 dates: hand-written table below; 2026 cross-checked
 *   against the official Portaria MGI nº 11.460, de 29/12/2025 (DOU 30/12/2025,
 *   https://www.in.gov.br/en/web/dou/-/portaria-mgi-n-11.460-de-29-de-dezembro-de-2025-678388627),
 *   which lists Carnaval 16/17/02, Quarta-Feira de Cinzas 18/02 and Corpus
 *   Christi 04/06. The other years follow Gauss plus the offsets from SPEC.md.
 */

interface ExpectedEntry {
  readonly data: string;
  readonly nome: string;
  readonly id: string;
}

/** Fixed-date national holidays, derived from the laws above (not from the library). */
const FIXED_BY_LAW: readonly (ExpectedEntry & { readonly since: number })[] = [
  {
    id: 'new-year',
    data: 'MM-01-01',
    nome: 'Confraternização Universal',
    since: 1950,
  },
  {
    id: 'tiradentes',
    data: 'MM-04-21',
    nome: 'Dia de Tiradentes',
    since: 1951,
  },
  {
    id: 'labour-day',
    data: 'MM-05-01',
    nome: 'Dia do Trabalho',
    since: 1949,
  },
  {
    id: 'independence-day',
    data: 'MM-09-07',
    nome: 'Dia da Independência',
    since: 1949,
  },
  {
    id: 'our-lady-of-apparecida',
    data: 'MM-10-12',
    nome: 'Dia de Nossa Senhora Aparecida',
    since: 1980,
  },
  {
    id: 'all-souls-day',
    data: 'MM-11-02',
    nome: 'Dia de Finados',
    since: 2003,
  },
  {
    id: 'black-consciousness-day',
    data: 'MM-11-20',
    nome: 'Dia Nacional de Zumbi e da Consciência Negra',
    since: 2024,
  },
  {
    id: 'republic-proclamation-day',
    data: 'MM-11-15',
    nome: 'Proclamação da República',
    since: 1949,
  },
  {
    id: 'christmas',
    data: 'MM-12-25',
    nome: 'Natal',
    since: 1949,
  },
];

/** Easter-derived ponto facultativo dates: id, name and offset from Easter. */
const MOVABLE_BY_SPEC: readonly {
  readonly id: string;
  readonly nome: string;
  readonly offset: number;
}[] = [
  { id: 'carnaval-monday', nome: 'Segunda-feira de Carnaval', offset: -48 },
  { id: 'carnaval-tuesday', nome: 'Terça-feira de Carnaval', offset: -47 },
  { id: 'ash-wednesday', nome: 'Quarta-Feira de Cinzas', offset: -46 },
  { id: 'corpus-christi', nome: 'Corpus Christi', offset: 60 },
];

function format(y: number, m: number, d: number): string {
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Gauss's Gregorian Easter algorithm (independent of Meeus/Jones/Butcher). */
function gaussEaster(year: number): readonly [number, number, number] {
  const a = year % 19;
  const b = year % 4;
  const c = year % 7;
  const k = Math.floor(year / 100);
  const p = Math.floor((8 * k + 13) / 25);
  const q = Math.floor(k / 4);
  const m = (((15 - p + q - k) % 30) + 30) % 30;
  const n = (((4 + k - q) % 7) + 7) % 7;
  const d = (19 * a + m) % 30;
  const e = (2 * b + 4 * c + 6 * d + n) % 7;
  // The two classic Gauss exceptions: without them the result would be
  // 26/04 and 25/04 respectively; Easter is 19/04 and 18/04.
  if (d === 29 && e === 6) {
    return [year, 4, 19];
  }
  if (d === 28 && e === 6 && a > 10) {
    return [year, 4, 18];
  }
  const marchDay = 22 + d + e;
  return marchDay > 31 ? [year, 4, marchDay - 31] : [year, 3, marchDay];
}

/** Whole-day offset from a [y,m,d] tuple using the platform calendar only. */
function shifted(easter: readonly [number, number, number], offset: number): string {
  const instant = new Date(Date.UTC(easter[0], easter[1] - 1, easter[2]));
  instant.setUTCDate(instant.getUTCDate() + offset);
  return format(instant.getUTCFullYear(), instant.getUTCMonth() + 1, instant.getUTCDate());
}

function fixedEntries(year: number): ExpectedEntry[] {
  return FIXED_BY_LAW.filter((rule) => year >= rule.since)
    .map((rule) => ({
      id: rule.id,
      data: rule.data.replace('MM', String(year)),
      nome: rule.nome,
    }))
    .sort((left, right) => left.data.localeCompare(right.data));
}

function movableEntries(year: number): ExpectedEntry[] {
  const easter = gaussEaster(year);
  return MOVABLE_BY_SPEC.map((rule) => ({
    id: rule.id,
    data: shifted(easter, rule.offset),
    nome: rule.nome,
  })).sort((left, right) => left.data.localeCompare(right.data));
}

function actualEntries(year: number): ExpectedEntry[] {
  return holidays(year).map((holiday) => ({
    data: toISO(holiday.date),
    nome: holiday.namePt,
    id: holiday.id,
  }));
}

/** Hand-written movable dates for ten years, cross-checked as documented above. */
const HAND_WRITTEN_MOVABLE_2024_2033: Readonly<Record<number, readonly string[]>> = {
  2024: ['2024-02-12', '2024-02-13', '2024-02-14', '2024-05-30'],
  2025: ['2025-03-03', '2025-03-04', '2025-03-05', '2025-06-19'],
  2026: ['2026-02-16', '2026-02-17', '2026-02-18', '2026-06-04'],
  2027: ['2027-02-08', '2027-02-09', '2027-02-10', '2027-05-27'],
  2028: ['2028-02-28', '2028-02-29', '2028-03-01', '2028-06-15'],
  2029: ['2029-02-12', '2029-02-13', '2029-02-14', '2029-05-31'],
  2030: ['2030-03-04', '2030-03-05', '2030-03-06', '2030-06-20'],
  2031: ['2031-02-24', '2031-02-25', '2031-02-26', '2031-06-12'],
  2032: ['2032-02-09', '2032-02-10', '2032-02-11', '2032-05-27'],
  2033: ['2033-02-28', '2033-03-01', '2033-03-02', '2033-06-16'],
};

describe('national expected table 2000-2035 — independent oracle', () => {
  it('matches every year exactly against dates derived from the laws', () => {
    // Replaces the old "compare dist against dist" fixture test. No snapshot
    // file is read: the expectation is reconstructed from the statutes.
    for (let year = 2000; year <= 2035; year += 1) {
      expect(actualEntries(year), `independent mismatches for ${year}`).toEqual(fixedEntries(year));
    }
  });

  it('derives every optional movable date with an independent Easter algorithm', () => {
    for (let year = 2000; year <= 2035; year += 1) {
      const actual = holidays(year, { include: ['optional'] }).map((holiday) => ({
        id: holiday.id,
        data: toISO(holiday.date),
        nome: holiday.namePt,
      }));
      expect(actual, `Gauss mismatch for ${year}`).toEqual(movableEntries(year));
    }
  });

  it('matches a hand-written 10-year table cross-checked with official calendars', () => {
    for (let year = 2024; year <= 2033; year += 1) {
      const expected = [...fixedEntries(year), ...movableEntries(year)].sort((left, right) =>
        left.data.localeCompare(right.data),
      );
      // The hand-written dates are an extra, separately sourced check on the
      // algorithmically derived ones.
      const handWritten = HAND_WRITTEN_MOVABLE_2024_2033[year];
      expect(handWritten, `missing hand-written row for ${year}`).toBeDefined();
      expect(movableEntries(year).map((entry) => entry.data)).toEqual(handWritten ?? []);
      expect(
        holidays(year, { include: ['national', 'optional'] }).map((holiday) => ({
          data: toISO(holiday.date),
          nome: holiday.namePt,
          id: holiday.id,
        })),
      ).toEqual(expected);
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
