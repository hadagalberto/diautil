import { describe, expect, it } from 'vitest';
import {
  CUSTOMARY_GOOD_FRIDAY_LAW,
  addBusinessDays,
  boletoDueDateAdjust,
  bankingHolidays,
  dayOfWeek,
  fromISO,
  holidays,
  isBusinessDay,
  isHoliday,
  toISO,
} from '../src/index.js';

const GOOD_FRIDAY_2026 = '2026-04-03';

describe('Sexta-feira da Paixão — legal vs customary vs banking calendars', () => {
  it('is a Friday and is absent from the legal national calendar', () => {
    expect(dayOfWeek(fromISO(GOOD_FRIDAY_2026))).toBe(5);
    expect(isHoliday(GOOD_FRIDAY_2026)).toBe(false);
    expect(holidays(2026).map((holiday) => toISO(holiday.date))).not.toContain(GOOD_FRIDAY_2026);
  });

  it('is false without a city and true with a city that declares it', () => {
    expect(isHoliday(GOOD_FRIDAY_2026)).toBe(false);
    const inSaoPaulo = isHoliday(GOOD_FRIDAY_2026, { city: 'São Paulo' });
    expect(inSaoPaulo).toBe(true);
    const municipal = holidays(2026, { city: 'São Paulo', include: ['municipal'] }).find(
      (entry) => toISO(entry.date) === GOOD_FRIDAY_2026,
    );
    expect(municipal?.namePt).toBe('Sexta-Feira Santa');
    expect(municipal?.law).toContain('14.485');
  });

  it('is added by includeCustomaryNational with an explicit non-national-law note', () => {
    const found = holidays(2026, { includeCustomaryNational: true });
    expect(found).toHaveLength(10);
    const goodFriday = found.find((entry) => toISO(entry.date) === GOOD_FRIDAY_2026);
    expect(goodFriday?.id).toBe('good-friday-customary');
    expect(goodFriday?.type).toBe('national');
    expect(goodFriday?.law).toBe(CUSTOMARY_GOOD_FRIDAY_LAW);
    expect(goodFriday?.note).toContain('9.093');
    expect(isHoliday(GOOD_FRIDAY_2026, { includeCustomaryNational: true })).toBe(true);
    expect(
      holidays(2026, { include: ['optional'], includeCustomaryNational: true }).map((holiday) =>
        toISO(holiday.date),
      ),
    ).not.toContain(GOOD_FRIDAY_2026);
  });

  it('merges the customary rule with a city rule into one entry per date', () => {
    const found = holidays(2026, { city: 'São Paulo', includeCustomaryNational: true });
    const onDate = found.filter((entry) => toISO(entry.date) === GOOD_FRIDAY_2026);
    expect(onDate).toHaveLength(1);
    expect(onDate[0]?.type).toBe('national');
    expect(onDate[0]?.alsoDeclaredBy?.[0]?.law).toContain('14.485');
    expect(new Set(found.map((holiday) => toISO(holiday.date))).size).toBe(found.length);
  });

  it('is a banking non-business day nationwide, regardless of city or customary option', () => {
    expect(isBusinessDay(GOOD_FRIDAY_2026)).toBe(true);
    expect(isBusinessDay(GOOD_FRIDAY_2026, { calendar: 'bancario' })).toBe(false);
    expect(
      isBusinessDay(GOOD_FRIDAY_2026, { calendar: 'bancario', includeCustomaryNational: true }),
    ).toBe(false);
    expect(isBusinessDay(GOOD_FRIDAY_2026, { calendar: 'bancario', city: 'São Paulo' })).toBe(
      false,
    );

    const banking = bankingHolidays(2026);
    const entry = banking.find((holiday) => holiday.id === 'bancario-good-friday');
    expect(entry).toBeDefined();
    expect(entry?.law).toContain('4.880');
    expect(entry?.law).toContain('B3');
    expect(entry?.source).toMatch(/^https:\/\/(www\.)?b3\.com\.br\//);
    expect(
      bankingHolidays(2026, { city: 'São Paulo' }).find(
        (holiday) => holiday.id === 'bancario-good-friday',
      )?.alsoDeclaredBy?.[0]?.law,
    ).toContain('14.485');
  });

  it('applies to settlement arithmetic and to other years', () => {
    expect(toISO(boletoDueDateAdjust(GOOD_FRIDAY_2026))).toBe('2026-04-06');
    expect(toISO(addBusinessDays('2026-04-02', 1, { calendar: 'bancario' }))).toBe('2026-04-06');
    for (const year of [2025, 2026, 2027, 2038]) {
      const entry = bankingHolidays(year).find((holiday) => holiday.id === 'bancario-good-friday');
      expect(entry).toBeDefined();
      expect(dayOfWeek(entry?.date ?? fromISO(GOOD_FRIDAY_2026))).toBe(5);
      const iso = toISO(entry?.date ?? fromISO(GOOD_FRIDAY_2026));
      expect(isBusinessDay(iso, { calendar: 'bancario' })).toBe(false);
      expect(isBusinessDay(iso)).toBe(true);
    }
  });
});
