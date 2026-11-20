import { describe, expect, it } from 'vitest';
import {
  CAPITALS,
  holidayName,
  holidays,
  isHoliday,
  municipalRulesByCapital,
  nextHoliday,
  toISO,
} from '../src/index.js';

/** Canonical legal dates for 2026 (Easter = 2026-04-05, Carnaval Tuesday = 17/02). */
const EXPECTED_2026: Readonly<Record<string, readonly string[]>> = {
  'Rio Branco': [],
  Maceió: ['2026-04-03', '2026-06-04', '2026-06-29', '2026-08-27', '2026-12-08'],
  Manaus: ['2026-02-17', '2026-04-03', '2026-06-04', '2026-09-05', '2026-10-24', '2026-12-08'],
  Macapá: [],
  Salvador: ['2026-06-24', '2026-12-08'],
  Fortaleza: ['2026-03-19', '2026-04-03', '2026-06-04', '2026-08-15'],
  Brasília: [],
  Vitória: ['2026-04-03', '2026-04-13', '2026-06-04', '2026-09-08'],
  Goiânia: ['2026-04-03', '2026-06-04', '2026-10-24'],
  'São Luís': ['2026-06-29', '2026-09-08', '2026-12-08'],
  'Belo Horizonte': ['2026-04-03', '2026-06-04', '2026-08-15', '2026-12-08'],
  'Campo Grande': ['2026-06-04', '2026-08-26'],
  Cuiabá: ['2026-04-08', '2026-06-04', '2026-12-08'],
  Belém: [],
  'João Pessoa': ['2026-06-24', '2026-08-05'],
  Recife: ['2026-04-03', '2026-06-24', '2026-07-16', '2026-12-08'],
  Teresina: ['2026-04-03', '2026-06-04', '2026-08-16', '2026-11-02', '2026-12-08'],
  Curitiba: ['2026-06-04', '2026-09-08'],
  'Rio de Janeiro': ['2026-01-20'],
  Natal: ['2026-01-06', '2026-04-03'],
  'Porto Velho': ['2026-01-24', '2026-05-24', '2026-10-02'],
  'Boa Vista': [],
  'Porto Alegre': ['2026-02-02', '2026-04-03', '2026-06-04', '2026-11-02'],
  Florianópolis: ['2026-03-23', '2026-04-03', '2026-06-04', '2026-11-02'],
  Aracaju: ['2026-03-17', '2026-12-08'],
  'São Paulo': ['2026-01-25', '2026-04-03', '2026-06-04', '2026-11-20'],
  Palmas: ['2026-03-19', '2026-04-03', '2026-05-20', '2026-11-02'],
};

describe('municipal holidays — one verified vector per capital', () => {
  it.each(CAPITALS)('%s resolves to its exact 2026 legal dates', (city) => {
    const actual = holidays(2026, { city, include: ['municipal'] }).map((holiday) =>
      toISO(holiday.date),
    );
    expect(actual).toEqual(EXPECTED_2026[city] ?? []);
  });

  it.each(CAPITALS)('%s rules carry a real citation, URL and scope', (city) => {
    for (const rule of municipalRulesByCapital[city] ?? []) {
      expect(rule.type).toBe('municipal');
      expect(rule.city).toBe(city);
      expect(rule.id).toMatch(/^[a-z-]+-/);
      expect(rule.namePt.length).toBeGreaterThan(0);
      expect(rule.nameEn.length).toBeGreaterThan(0);
      expect(rule.law).toMatch(/Lei|Decreto|Constituição|Emenda/);
      expect(rule.source).toMatch(/^https?:\/\//);
    }
  });

  it.each(CAPITALS.filter((city) => (EXPECTED_2026[city] ?? []).length > 0))(
    '%s marks each of its municipal holidays with isHoliday',
    (city) => {
      const nationalDates = new Set(holidays(2026).map((holiday) => toISO(holiday.date)));
      for (const iso of EXPECTED_2026[city] ?? []) {
        expect(isHoliday(iso, { city })).toBe(true);
        // A scoped date appears in the default calendar only when it is also national.
        expect(isHoliday(iso)).toBe(nationalDates.has(iso));
      }
    },
  );

  it('treats Brasília as having no municipal law (DF is not a municipality)', () => {
    expect(municipalRulesByCapital['Brasília']).toEqual([]);
    expect(holidays(2026, { city: 'Brasília', include: ['municipal'] })).toEqual([]);
    expect(holidays(2026, { uf: 'DF', include: ['state'] })).toHaveLength(5);
  });
});

describe('municipal holiday API with city filter', () => {
  it('matches capital names case- and accent-insensitively', () => {
    const canonical = holidays(2026, { city: 'São Paulo', include: ['municipal'] });
    expect(holidays(2026, { city: 'sao paulo', include: ['municipal'] })).toEqual(canonical);
    expect(holidays(2026, { city: 'SAO PAULO', include: ['municipal'] })).toEqual(canonical);
  });

  it('combines national, state and municipal scopes independently', () => {
    const both = holidays(2026, { uf: 'RJ', city: 'Rio de Janeiro' });
    const ids = both.map((holiday) => holiday.id);
    expect(ids).toContain('rj-sao-jorge');
    expect(ids).toContain('rio-de-janeiro-sao-sebastiao');
    expect(capitalOnlyScopeDoesNotLeakOtherStates());
  });

  it('returns pt-BR and en names and finds the next municipal holiday', () => {
    expect(holidayName('2026-01-25', { city: 'São Paulo' })).toBe(
      'Aniversário da Cidade de São Paulo',
    );
    expect(holidayName('2026-01-25', { city: 'São Paulo' }, 'en')).toBe('São Paulo Anniversary');
    expect(holidayName('2026-01-25')).toBeUndefined();
    const found = nextHoliday('2026-01-24', { city: 'São Paulo' });
    expect(found?.id).toBe('sao-paulo-aniversario');
  });
});

function capitalOnlyScopeDoesNotLeakOtherStates(): boolean {
  const ids = holidays(2026, { city: 'São Paulo' }).map((holiday) => holiday.id);
  return !ids.some((id) => id.startsWith('rj-'));
}
