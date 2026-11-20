import { describe, expect, it } from 'vitest';
import {
  evaluateRule,
  evaluateRules,
  moveToMonday,
  plainDate,
  resolveRuleDate,
  ruleAppliesToYear,
  toISO,
  type EasterOffsetRule,
  type FixedRule,
  type HolidayRule,
  type MovedToMondayRule,
  type NthWeekdayRule,
} from '../src/index.js';

const fixedRule: FixedRule = {
  kind: 'fixed',
  id: 'test-fixed',
  namePt: 'Feriado fixo',
  nameEn: 'Fixed holiday',
  type: 'national',
  law: 'Lei de teste nº 1',
  since: 2000,
  until: 2010,
  note: 'nota de teste',
  month: 10,
  day: 15,
};

const easterRule: EasterOffsetRule = {
  kind: 'easter',
  id: 'test-easter',
  namePt: 'Feriado móvel',
  nameEn: 'Movable holiday',
  type: 'optional',
  law: 'Lei de teste nº 2',
  offset: -48,
};

const nthRule: NthWeekdayRule = {
  kind: 'nthWeekday',
  id: 'test-nth',
  namePt: 'Segunda-feira de teste',
  nameEn: 'Test Monday',
  type: 'state',
  law: 'Lei de teste nº 3',
  month: 2,
  weekday: 1,
  nth: 1,
};

const movedRule: MovedToMondayRule = {
  kind: 'movedToMonday',
  id: 'test-moved',
  namePt: 'Feriado transferido',
  nameEn: 'Moved holiday',
  type: 'municipal',
  law: 'Lei de teste nº 4',
  direction: 'next',
  base: fixedRule,
};

describe('rule engine: year validity', () => {
  it('respects inclusive since/until bounds', () => {
    expect(ruleAppliesToYear(fixedRule, 1999)).toBe(false);
    expect(ruleAppliesToYear(fixedRule, 2000)).toBe(true);
    expect(ruleAppliesToYear(fixedRule, 2010)).toBe(true);
    expect(ruleAppliesToYear(fixedRule, 2011)).toBe(false);
    expect(ruleAppliesToYear(easterRule, 1900)).toBe(true);
    expect(ruleAppliesToYear(easterRule, 2199)).toBe(true);
    expect(ruleAppliesToYear(easterRule, 2200)).toBe(false);
    expect(ruleAppliesToYear(easterRule, Number.NaN)).toBe(false);
  });

  it('returns undefined outside the validity window and keeps the note inside it', () => {
    expect(evaluateRule(fixedRule, 2005)).toEqual({
      id: 'test-fixed',
      date: plainDate(2005, 10, 15),
      namePt: 'Feriado fixo',
      nameEn: 'Fixed holiday',
      type: 'national',
      law: 'Lei de teste nº 1',
      note: 'nota de teste',
    });
    expect(evaluateRule(fixedRule, 2011)).toBeUndefined();
    expect(evaluateRule(easterRule, 2020)).not.toHaveProperty('note');
  });
});

describe('rule engine: date resolution', () => {
  it('resolves fixed, Easter-offset and nth-weekday rules', () => {
    expect(toISO(resolveRuleDate(fixedRule, 2005))).toBe('2005-10-15');
    expect(toISO(resolveRuleDate(easterRule, 2026))).toBe('2026-02-16');
    expect(toISO(resolveRuleDate(nthRule, 2024))).toBe('2024-02-05');
    expect(toISO(resolveRuleDate(movedRule, 2005))).toBe('2005-10-17');
  });

  it('moves to the nearest Monday in the requested direction', () => {
    const tuesday = plainDate(2026, 4, 21);
    const sunday = plainDate(2026, 4, 5);
    const monday = plainDate(2026, 12, 7);
    expect(toISO(moveToMonday(tuesday, 'previous'))).toBe('2026-04-20');
    expect(toISO(moveToMonday(tuesday, 'next'))).toBe('2026-04-27');
    expect(toISO(moveToMonday(sunday, 'previous'))).toBe('2026-03-30');
    expect(toISO(moveToMonday(sunday, 'next'))).toBe('2026-04-06');
    expect(moveToMonday(monday, 'previous')).toBe(monday);
    expect(moveToMonday(monday, 'next')).toBe(monday);
  });

  it('propagates metadata from a moved rule', () => {
    const evaluated = evaluateRule(movedRule, 2005);
    expect(evaluated?.id).toBe('test-moved');
    expect(evaluated?.law).toBe('Lei de teste nº 4');
    expect(evaluated?.type).toBe('municipal');
    expect(toISO(evaluated?.date ?? plainDate(1900, 1, 1))).toBe('2005-10-17');
  });

  it('rejects invalid years when resolving dates directly', () => {
    expect(() => resolveRuleDate(fixedRule, 1899)).toThrow(RangeError);
    expect(() => resolveRuleDate(easterRule, 2200)).toThrow(RangeError);
  });

  it('evaluates and sorts a collection of rules by date', () => {
    const rules: readonly HolidayRule[] = [nthRule, fixedRule, easterRule, movedRule];
    const result = evaluateRules(rules, 2005);
    expect(result.map((holiday) => toISO(holiday.date))).toEqual([
      '2005-02-07',
      '2005-02-07',
      '2005-10-15',
      '2005-10-17',
    ]);
    expect(evaluateRules([fixedRule], 2011)).toEqual([]);
  });
});
