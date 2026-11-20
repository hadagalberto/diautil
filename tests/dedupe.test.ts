import { describe, expect, it } from 'vitest';
import {
  deduplicateHolidays,
  fromISO,
  holidays,
  toISO,
  withAlsoDeclaredBy,
  type Holiday,
} from '../src/index.js';

function holiday(id: string, iso: string, type: Holiday['type'], law: string): Holiday {
  return {
    id,
    date: fromISO(iso),
    namePt: id,
    nameEn: id,
    type,
    law,
  };
}

describe('date deduplication — legal precedence and citation merging', () => {
  it('keeps the national rule and merges a restating municipal rule (Finados, Teresina)', () => {
    const found = holidays(2026, { city: 'Teresina' });
    const finados = found.filter((entry) => toISO(entry.date) === '2026-11-02');
    expect(finados).toHaveLength(1);
    const kept = finados[0];
    expect(kept?.id).toBe('all-souls-day');
    expect(kept?.type).toBe('national');
    expect(kept?.law).toContain('10.607');
    expect(kept?.alsoDeclaredBy?.map((entry) => entry.law)).toContainEqual(
      expect.stringContaining('Lei Municipal nº 2.275'),
    );
    expect(kept?.alsoDeclaredBy?.[0]?.city).toBe('Teresina');
    expect(kept?.alsoDeclaredBy?.[0]?.type).toBe('municipal');
  });

  it('merges state and municipal citations into the national rule without duplicates', () => {
    const found = holidays(2026, { uf: 'DF' });
    const tiradentes = found.filter((entry) => toISO(entry.date) === '2026-04-21');
    expect(tiradentes).toHaveLength(1);
    expect(tiradentes[0]?.id).toBe('tiradentes');
    expect(tiradentes[0]?.alsoDeclaredBy?.map((entry) => entry.law)).toContainEqual(
      expect.stringContaining('Lei nº 72'),
    );

    // Corrected in milestone 6: the old scope {uf: 'RJ', city: 'São Paulo'}
    // encoded the reviewed bug — it silently mixed RJ state rules with São
    // Paulo municipal rules and is now a RangeError. The two declarations are
    // checked with their own valid scopes instead; no assertion is dropped.
    const black = holidays(2026, { city: 'São Paulo' }).filter(
      (entry) => toISO(entry.date) === '2026-11-20',
    );
    expect(black).toHaveLength(1);
    expect(black[0]?.type).toBe('national');
    expect(black[0]?.alsoDeclaredBy?.map((entry) => entry.type).sort()).toEqual(['municipal']);
    const rj = holidays(2026, { uf: 'RJ' }).filter((entry) => toISO(entry.date) === '2026-11-20');
    expect(rj).toHaveLength(1);
    expect(rj[0]?.alsoDeclaredBy?.map((entry) => entry.type)).toEqual(['state']);
    expect(() => holidays(2026, { uf: 'RJ', city: 'São Paulo' })).toThrow(RangeError);
  });

  it('keeps the caller-selected type when the calendar is filtered', () => {
    const municipalOnly = holidays(2026, { city: 'Teresina', include: ['municipal'] });
    const finados = municipalOnly.find((entry) => toISO(entry.date) === '2026-11-02');
    expect(finados?.type).toBe('municipal');
    expect(finados?.alsoDeclaredBy).toBeUndefined();
    expect(holidays(2026, { city: 'Teresina', include: [] })).toEqual([]);
  });

  it('does not add alsoDeclaredBy to unique dates', () => {
    const unique = deduplicateHolidays([holiday('only', '2026-01-01', 'national', 'Lei 662/1949')]);
    expect(unique).toHaveLength(1);
    expect(unique[0]?.alsoDeclaredBy).toBeUndefined();
  });

  it('ranks national > state > municipal > optional on an arbitrary shared date', () => {
    const date = '2026-07-09';
    const result = deduplicateHolidays([
      holiday('optional', date, 'optional', 'Lei opcional'),
      holiday('municipal', date, 'municipal', 'Lei municipal'),
      holiday('state', date, 'state', 'Lei estadual'),
      holiday('national', date, 'national', 'Lei nacional'),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('national');
    expect(result[0]?.alsoDeclaredBy?.map((entry) => `${entry.type}:${entry.law}`)).toEqual([
      'optional:Lei opcional',
      'municipal:Lei municipal',
      'state:Lei estadual',
    ]);
  });

  it('prefers the first rule when two declarations have equal precedence', () => {
    const result = deduplicateHolidays([
      holiday('first', '2026-05-01', 'municipal', 'Lei A'),
      holiday('second', '2026-05-01', 'municipal', 'Lei B'),
    ]);
    expect(result[0]?.id).toBe('first');
    expect(result[0]?.alsoDeclaredBy?.map((entry) => entry.law)).toEqual(['Lei B']);
  });

  it('merges banking citations through withAlsoDeclaredBy without repeating a law', () => {
    const kept = holiday('kept', '2026-04-03', 'optional', 'Lei bancária');
    const once = withAlsoDeclaredBy(kept, [
      holiday('local', '2026-04-03', 'municipal', 'Lei municipal'),
      holiday('duplicate', '2026-04-03', 'municipal', 'Lei municipal'),
    ]);
    expect(once.alsoDeclaredBy).toHaveLength(1);
    expect(once.alsoDeclaredBy?.[0]?.id).toBe('local');
  });

  it('sorts the surviving entries by calendar date', () => {
    const result = deduplicateHolidays([
      holiday('dec', '2026-12-25', 'national', 'Lei 662/1949'),
      holiday('jan', '2026-01-01', 'national', 'Lei 662/1949'),
      holiday('jun', '2026-06-04', 'municipal', 'Lei municipal'),
    ]);
    expect(result.map((entry) => toISO(entry.date))).toEqual([
      '2026-01-01',
      '2026-06-04',
      '2026-12-25',
    ]);
  });
});
