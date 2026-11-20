import { describe, expect, it } from 'vitest';
import {
  BANKING_LAW,
  BANKING_NOTE,
  BANKING_SOURCE,
  DEFAULT_WEEKENDS,
  addBusinessDays,
  calendarHolidays,
  createCalendar,
  isBusinessDay,
  toISO,
} from '../src/index.js';

describe('createCalendar', () => {
  it('reuses an immutable instance for equivalent options', () => {
    const first = createCalendar({ uf: 'SP' });
    const second = createCalendar({ uf: 'SP' });
    expect(first).toBe(second);
    expect(createCalendar({ uf: 'RJ' })).not.toBe(first);
    // City matching is canonical, so spelling variants share the same cache entry.
    expect(createCalendar({ city: 'sao paulo' })).toBe(createCalendar({ city: 'São Paulo' }));
  });

  it('exposes resolved options without mutating them', () => {
    const calendar = createCalendar({ calendar: 'bancario', weekends: [0, 6, 1], uf: 'SP' });
    expect(calendar.options.calendar).toBe('bancario');
    expect(calendar.options.weekends).toEqual([0, 6, 1]); // copied, input order preserved
    expect(calendar.options.uf).toBe('SP');
  });

  it('adds state and municipal holidays to the business-day rules', () => {
    expect(isBusinessDay('2026-04-23')).toBe(true);
    expect(isBusinessDay('2026-04-23', { uf: 'RJ' })).toBe(false);
    // Good Friday is a São Paulo municipal holiday but not a national one.
    expect(isBusinessDay('2026-04-03')).toBe(true);
    expect(isBusinessDay('2026-04-03', { city: 'São Paulo' })).toBe(false);
    expect(isBusinessDay('2026-04-03', { uf: 'SP', city: 'São Paulo' })).toBe(false);
  });

  it('respects the include filter', () => {
    // 20/11/2026 is a national holiday; with no holidays it becomes a business day.
    expect(isBusinessDay('2026-11-20', { include: [] })).toBe(true);
    expect(isBusinessDay('2026-11-20', { include: ['national'] })).toBe(false);
    expect(calendarHolidays(2026, { include: [] })).toEqual([]);
  });

  it('adds custom holidays with labels and source metadata', () => {
    const calendar = createCalendar({
      extraHolidays: [
        '2026-11-19',
        {
          date: '2026-11-18',
          namePt: 'Feriado da empresa',
          nameEn: 'Company holiday',
          law: 'Internal policy',
          source: 'https://example.org/policy',
        },
      ],
    });
    expect(calendar.isBusinessDay('2026-11-19')).toBe(false);
    expect(calendar.isBusinessDay('2026-11-18')).toBe(false);
    const custom = calendar.holidays(2026).find((holiday) => holiday.date.day === 18);
    expect(custom?.namePt).toBe('Feriado da empresa');
    expect(custom?.nameEn).toBe('Company holiday');
    expect(custom?.law).toBe('Internal policy');
    expect(custom?.source).toBe('https://example.org/policy');
    const bare = calendar.holidays(2026).find((holiday) => holiday.date.day === 19);
    expect(bare?.namePt).toBe('Feriado personalizado');
    expect(bare?.law).toBe('createCalendar: extraHolidays');
  });

  it('removes holidays from the calendar', () => {
    expect(isBusinessDay('2026-11-20')).toBe(false);
    expect(isBusinessDay('2026-11-20', { removeHolidays: ['2026-11-20'] })).toBe(true);
    const calendar = createCalendar({
      removeHolidays: ['2026-11-20'],
      extraHolidays: ['2026-11-19'],
    });
    expect(calendar.isBusinessDay('2026-11-20')).toBe(true);
    expect(calendar.isBusinessDay('2026-11-19')).toBe(false);
  });

  it('lets custom Date objects be used as extra/removed holidays', () => {
    const date = new Date('2026-11-18T12:00:00Z');
    const calendar = createCalendar({
      extraHolidays: [{ date, namePt: 'Personalizado' }],
      removeHolidays: [new Date('2026-11-20T12:00:00Z')],
    });
    expect(calendar.isBusinessDay('2026-11-18')).toBe(false);
    expect(calendar.isBusinessDay('2026-11-20')).toBe(true);
  });
});

describe('banking calendar', () => {
  it('marks Carnaval Monday and Tuesday as non-business days', () => {
    expect(isBusinessDay('2026-02-16')).toBe(true);
    expect(isBusinessDay('2026-02-17')).toBe(true);
    expect(isBusinessDay('2026-02-16', { calendar: 'bancario' })).toBe(false);
    expect(isBusinessDay('2026-02-17', { calendar: 'bancario' })).toBe(false);
    expect(isBusinessDay('2026-02-18', { calendar: 'bancario' })).toBe(true);
    expect(toISO(addBusinessDays('2026-02-13', 3, { calendar: 'bancario' }))).toBe('2026-02-20');
  });

  it('still observes national holidays and keeps the documented source', () => {
    expect(isBusinessDay('2026-12-25', { calendar: 'bancario' })).toBe(false);
    const carnaval = calendarHolidays(2026, { calendar: 'bancario' }).filter((holiday) =>
      holiday.id.startsWith('bancario-carnaval'),
    );
    expect(carnaval).toHaveLength(2);
    expect(carnaval[0]?.law).toContain(BANKING_LAW);
    expect(carnaval[0]?.source).toBe(BANKING_SOURCE);
    expect(carnaval[0]?.note).toBe(BANKING_NOTE);
    expect(BANKING_SOURCE).toMatch(/^https:\/\//);
  });

  it('includes national holidays even when include is narrowed', () => {
    const holidaysInYear = calendarHolidays(2026, {
      calendar: 'bancario',
      include: ['optional'],
    });
    expect(holidaysInYear.some((holiday) => holiday.id === 'new-year')).toBe(true);
    expect(holidaysInYear.some((holiday) => holiday.id === 'bancario-carnaval-monday')).toBe(true);
  });

  it('defaults to Saturday and Sunday as weekends', () => {
    expect(DEFAULT_WEEKENDS).toEqual([0, 6]);
  });
});
