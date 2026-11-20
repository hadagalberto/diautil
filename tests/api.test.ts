import { describe, expect, it } from 'vitest';
import {
  findHolidays,
  holidayName,
  holidays,
  isHoliday,
  nextHoliday,
  plainDate,
  toISO,
  toPlainDate,
  type DateInput,
} from '../src/index.js';

describe('input normalization', () => {
  it('accepts PlainDate, ISO strings and Date values', () => {
    const expected = plainDate(2024, 11, 20);
    expect(toPlainDate(expected)).toEqual(expected);
    expect(toPlainDate('2024-11-20')).toEqual(expected);
    expect(toPlainDate(new Date('2024-11-20T12:00:00Z'))).toEqual(expected);
  });

  it('rejects unsupported values', () => {
    expect(() => toPlainDate(42 as unknown as DateInput)).toThrow(TypeError);
    expect(() => toPlainDate({} as unknown as DateInput)).toThrow(TypeError);
  });
});

describe('isHoliday and holidayName', () => {
  it('recognizes national holidays from every accepted input type', () => {
    expect(isHoliday('2024-11-20')).toBe(true);
    expect(isHoliday(plainDate(2024, 11, 20))).toBe(true);
    expect(isHoliday(new Date('2024-11-20T12:00:00Z'))).toBe(true);
    expect(isHoliday('2024-11-21')).toBe(false);
    expect(isHoliday('2024-06-04')).toBe(false);
  });

  it('interprets Date inputs in America/Sao_Paulo', () => {
    expect(isHoliday(new Date('2024-11-19T02:00:00Z'))).toEqual(isHoliday('2024-11-19'));
    expect(isHoliday(new Date('2024-11-20T03:00:00Z'))).toBe(true);
  });

  it('returns names in pt-BR and en and undefined for ordinary days', () => {
    expect(holidayName('2024-11-20')).toBe('Dia Nacional de Zumbi e da Consciência Negra');
    expect(holidayName('2024-11-20', {}, 'en')).toBe('Zumbi and Black Consciousness Day');
    expect(holidayName('2024-11-21')).toBeUndefined();
    expect(holidayName('2026-02-16', { include: ['optional'] }, 'en')).toBe('Carnaval Monday');
  });

  it('finds all holidays on a date', () => {
    expect(findHolidays('2024-12-25')).toHaveLength(1);
    expect(findHolidays('2024-12-24')).toEqual([]);
  });

  it('respects the include filter', () => {
    expect(holidays(2024, { include: [] })).toEqual([]);
    expect(isHoliday('2026-02-16')).toBe(false);
    expect(isHoliday('2026-02-16', { include: ['optional'] })).toBe(true);
  });

  it('rejects years outside the supported range', () => {
    expect(() => holidays(1899)).toThrow(RangeError);
    expect(() => holidays(2200)).toThrow(RangeError);
  });
});

describe('nextHoliday', () => {
  it('returns the next holiday strictly after the input date', () => {
    // 25/11 is not a national holiday; the next one after 20/11/2023 is Christmas.
    expect(toISO(nextHoliday('2023-11-20')?.date ?? plainDate(1900, 1, 1))).toBe('2023-12-25');
    expect(toISO(nextHoliday('2023-12-25')?.date ?? plainDate(1900, 1, 1))).toBe('2024-01-01');
    expect(toISO(nextHoliday('2024-11-20')?.date ?? plainDate(1900, 1, 1))).toBe('2024-12-25');
  });

  it('works with optional types and accepts Date inputs', () => {
    const found = nextHoliday('2026-02-15', { include: ['optional'] });
    expect(found?.id).toBe('carnaval-monday');
    expect(toISO(found?.date ?? plainDate(1900, 1, 1))).toBe('2026-02-16');
    expect(nextHoliday(new Date('2024-12-25T12:00:00Z'))?.id).toBe('new-year');
  });

  it('returns undefined at the end of the supported range', () => {
    expect(nextHoliday('2199-12-31')).toBeUndefined();
  });
});
