/**
 * Declarative holiday rule engine. Every rule carries its legal source and
 * optional year validity (`since`/`until`). Nothing here depends on national
 * data, so custom calendars can reuse the engine.
 */
import {
  addDays,
  compareDates,
  dayOfWeek,
  isValidYear,
  nthWeekdayOfMonth,
  plainDate,
  type PlainDate,
} from '../plain-date.js';
import { easterSunday } from '../easter.js';
import type { Holiday, HolidayRule } from './types.js';

/** True when the rule is legally in force in `year`. */
export function ruleAppliesToYear(rule: HolidayRule, year: number): boolean {
  if (!isValidYear(year)) {
    return false;
  }
  if (rule.since !== undefined && year < rule.since) {
    return false;
  }
  if (rule.until !== undefined && year > rule.until) {
    return false;
  }
  return true;
}

/** Move a date to the nearest Monday in the requested direction (same date if already Monday). */
export function moveToMonday(date: PlainDate, direction: 'previous' | 'next'): PlainDate {
  const weekday = dayOfWeek(date);
  if (weekday === 1) {
    return date;
  }
  const delta = direction === 'next' ? (1 - weekday + 7) % 7 : -((weekday - 1 + 7) % 7);
  return addDays(date, delta);
}

/** Resolve a rule to a concrete date, ignoring `since`/`until`. */
export function resolveRuleDate(rule: HolidayRule, year: number): PlainDate {
  if (!isValidYear(year)) {
    throw new RangeError(`year must be an integer between 1900 and 2199, got ${String(year)}`);
  }
  switch (rule.kind) {
    case 'fixed':
      return plainDate(year, rule.month, rule.day);
    case 'easter':
      return addDays(easterSunday(year), rule.offset);
    case 'nthWeekday':
      return nthWeekdayOfMonth(year, rule.month, rule.weekday, rule.nth);
    case 'movedToMonday':
      return moveToMonday(resolveRuleDate(rule.base, year), rule.direction);
  }
}

/** Evaluate a single rule for a year, or `undefined` when it is not in force. */
export function evaluateRule(rule: HolidayRule, year: number): Holiday | undefined {
  if (!ruleAppliesToYear(rule, year)) {
    return undefined;
  }
  const date = resolveRuleDate(rule, year);
  return {
    id: rule.id,
    date,
    namePt: rule.namePt,
    nameEn: rule.nameEn,
    type: rule.type,
    law: rule.law,
    ...(rule.note === undefined ? {} : { note: rule.note }),
  };
}

/** Evaluate a set of rules, returning holidays sorted by calendar date. */
export function evaluateRules(rules: readonly HolidayRule[], year: number): Holiday[] {
  const result: Holiday[] = [];
  for (const rule of rules) {
    const holiday = evaluateRule(rule, year);
    if (holiday !== undefined) {
      result.push(holiday);
    }
  }
  return result.sort((a, b) => compareDates(a.date, b.date));
}
