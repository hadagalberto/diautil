/**
 * Public holiday API. Milestone 1 ships national data only; `uf`/`city`
 * calendars are added by later milestones and are deliberately not accepted
 * here yet so the options object cannot silently do nothing.
 */
import {
  compareDates,
  fromDate,
  fromISO,
  isPlainDate,
  isValidYear,
  MAX_YEAR,
  type PlainDate,
} from '../plain-date.js';
import { nationalRules } from './national.js';
import { evaluateRules } from './rules.js';
import type { Holiday, HolidayType, Locale } from './types.js';

/** Any value accepted by the API boundary. */
export type DateInput = PlainDate | string | Date;

export interface HolidayOptions {
  /** Holiday types to consider. Defaults to `['national']`. */
  readonly include?: readonly HolidayType[];
}

const DEFAULT_INCLUDE: readonly HolidayType[] = ['national'];
const yearCache = new Map<number, Holiday[]>();

/** Normalize any accepted input into a validated `PlainDate`. */
export function toPlainDate(input: DateInput): PlainDate {
  if (isPlainDate(input)) {
    return input;
  }
  if (typeof input === 'string') {
    return fromISO(input);
  }
  if (input instanceof Date) {
    return fromDate(input);
  }
  throw new TypeError('expected a PlainDate, an ISO YYYY-MM-DD string or a Date');
}

function allHolidaysInYear(year: number): Holiday[] {
  const cached = yearCache.get(year);
  if (cached !== undefined) {
    return cached;
  }
  const evaluated = evaluateRules(nationalRules, year);
  yearCache.set(year, evaluated);
  return evaluated;
}

function includedTypes(options: HolidayOptions): ReadonlySet<HolidayType> {
  return new Set<HolidayType>(options.include ?? DEFAULT_INCLUDE);
}

/** All holidays of `year`, sorted by date. */
export function holidays(year: number, options: HolidayOptions = {}): Holiday[] {
  if (!isValidYear(year)) {
    throw new RangeError(`year must be an integer between 1900 and 2199, got ${String(year)}`);
  }
  const types = includedTypes(options);
  if (types.size === 0) {
    return [];
  }
  return allHolidaysInYear(year).filter((holiday) => types.has(holiday.type));
}

/** All holidays falling exactly on `date`. */
export function findHolidays(date: DateInput, options: HolidayOptions = {}): Holiday[] {
  const plain = toPlainDate(date);
  return holidays(plain.year, options).filter((holiday) => compareDates(holiday.date, plain) === 0);
}

/** True when `date` is a holiday of the selected types. */
export function isHoliday(date: DateInput, options: HolidayOptions = {}): boolean {
  return findHolidays(date, options).length > 0;
}

/** Holiday name on `date`, or `undefined`. Portuguese by default. */
export function holidayName(
  date: DateInput,
  options: HolidayOptions = {},
  lang: Locale = 'pt-BR',
): string | undefined {
  const found = findHolidays(date, options)[0];
  if (found === undefined) {
    return undefined;
  }
  return lang === 'en' ? found.nameEn : found.namePt;
}

/** First holiday strictly after `date`, or `undefined` at the end of the range. */
export function nextHoliday(date: DateInput, options: HolidayOptions = {}): Holiday | undefined {
  const plain = toPlainDate(date);
  for (let year = plain.year; year <= MAX_YEAR; year += 1) {
    const found = holidays(year, options).find((holiday) => compareDates(holiday.date, plain) > 0);
    if (found !== undefined) {
      return found;
    }
  }
  return undefined;
}
