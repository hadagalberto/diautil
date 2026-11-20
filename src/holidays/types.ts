import type { PlainDate, Weekday } from '../plain-date.js';

/** Scope of a holiday rule. Only `national` data ships in milestone 1. */
export type HolidayType = 'national' | 'state' | 'municipal' | 'optional';

/** Output language for holiday names. */
export type Locale = 'pt-BR' | 'en';

export interface Holiday {
  readonly id: string;
  readonly date: PlainDate;
  readonly namePt: string;
  readonly nameEn: string;
  readonly type: HolidayType;
  /** Legal source: law/decree number and article, never invented. */
  readonly law: string;
  readonly note?: string;
}

interface RuleMeta {
  readonly id: string;
  readonly namePt: string;
  readonly nameEn: string;
  readonly type: HolidayType;
  readonly law: string;
  /** First year in which the rule applies (inclusive). */
  readonly since?: number;
  /** Last year in which the rule applies (inclusive). */
  readonly until?: number;
  readonly note?: string;
}

/** A fixed month/day holiday. */
export interface FixedRule extends RuleMeta {
  readonly kind: 'fixed';
  readonly month: number;
  readonly day: number;
}

/** A holiday defined as an offset in days from Easter Sunday. */
export interface EasterOffsetRule extends RuleMeta {
  readonly kind: 'easter';
  readonly offset: number;
}

/** Nth weekday of a month; use a negative `nth` to count from the end. */
export interface NthWeekdayRule extends RuleMeta {
  readonly kind: 'nthWeekday';
  readonly month: number;
  readonly weekday: Weekday;
  readonly nth: number;
}

type DirectRule = FixedRule | EasterOffsetRule | NthWeekdayRule;

/** A rule whose observed date is moved to the nearest Monday, per law. */
export interface MovedToMondayRule extends RuleMeta {
  readonly kind: 'movedToMonday';
  readonly base: DirectRule;
  readonly direction: 'previous' | 'next';
}

export type HolidayRule = DirectRule | MovedToMondayRule;
