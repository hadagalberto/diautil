/**
 * Public holiday API. Supports national, state (UF) and capital-city
 * (municipal) calendars with independent `uf`, `city` and `include` filters.
 *
 * Scope semantics: the calendar is the union of the scopes selected by the
 * options. With no `uf`/`city` the calendar is national-only (the milestone-1
 * behaviour). `uf` adds that unit's state holidays; `city` adds that capital's
 * municipal holidays. `include` then filters by holiday type; when omitted it
 * defaults to the three real-holiday types, leaving `optional` (ponto
 * facultativo) opt-in.
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
import { deduplicateHolidays } from './dedupe.js';
import { canonicalCapital, isUF, type UF } from './geo.js';
import { municipalRulesByCapital } from './municipal.js';
import { customaryNationalRules, nationalRules } from './national.js';
import { evaluateRules } from './rules.js';
import { stateRulesByUF } from './state.js';
import type { Holiday, HolidayRule, HolidayType, Locale } from './types.js';

/** Any value accepted by the API boundary. */
export type DateInput = PlainDate | string | Date;

export interface HolidayOptions {
  /** Federative unit whose state holidays are added to the calendar. */
  readonly uf?: UF;
  /** Canonical capital name whose municipal holidays are added to the calendar. */
  readonly city?: string;
  /** Holiday types to consider. Defaults to `['national', 'state', 'municipal']`. */
  readonly include?: readonly HolidayType[];
  /**
   * Add Good Friday to the national calendar as a customary (not legal) national
   * holiday. Off by default: Lei 9.093/1995 art. 2º makes it a municipal
   * religious holiday, so `isHoliday('2026-04-03')` is false without a city.
   */
  readonly includeCustomaryNational?: boolean;
}

const DEFAULT_INCLUDE: readonly HolidayType[] = ['national', 'state', 'municipal'];
const yearCache = new Map<string, Holiday[]>();

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

function includedTypes(options: HolidayOptions): ReadonlySet<HolidayType> {
  return new Set<HolidayType>(options.include ?? DEFAULT_INCLUDE);
}

/** Validate scope options and return the canonical capital name, if any. */
function canonicalCity(options: HolidayOptions): string | undefined {
  if (options.uf !== undefined && !isUF(options.uf)) {
    throw new RangeError(`unknown UF: ${String(options.uf)}`);
  }
  if (options.city === undefined) {
    return undefined;
  }
  const city = canonicalCapital(options.city);
  if (city === undefined) {
    throw new RangeError(`unknown capital city: ${options.city}`);
  }
  return city;
}

/** Rule set selected by the scope options, before the type filter is applied. */
export function rulesForOptions(options: HolidayOptions = {}): HolidayRule[] {
  const city = canonicalCity(options);
  const rules: HolidayRule[] = [...nationalRules];
  if (options.includeCustomaryNational === true) {
    rules.push(...customaryNationalRules);
  }
  if (options.uf !== undefined) {
    rules.push(...stateRulesByUF[options.uf]);
  }
  if (city !== undefined) {
    rules.push(...(municipalRulesByCapital[city] ?? []));
  }
  return rules;
}

function cacheKey(year: number, options: HolidayOptions, city: string | undefined): string {
  const include = options.include === undefined ? '' : [...options.include].sort().join(',');
  const customary = options.includeCustomaryNational === true ? 'customary' : '';
  return `${year}|${options.uf ?? ''}|${city ?? ''}|${include}|${customary}`;
}

function allHolidaysInYear(
  year: number,
  options: HolidayOptions,
  city: string | undefined,
): Holiday[] {
  const key = cacheKey(year, options, city);
  const cached = yearCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const evaluated = evaluateRules(rulesForOptions(options), year);
  yearCache.set(key, evaluated);
  return evaluated;
}

/** All holidays of `year`, sorted by date. */
export function holidays(year: number, options: HolidayOptions = {}): Holiday[] {
  if (!isValidYear(year)) {
    throw new RangeError(`year must be an integer between 1900 and 2199, got ${String(year)}`);
  }
  const city = canonicalCity(options);
  const types = includedTypes(options);
  if (types.size === 0) {
    return [];
  }
  const matched = allHolidaysInYear(year, options, city).filter((holiday) =>
    types.has(holiday.type),
  );
  // Deduplicate AFTER the type filter so a narrower `include` never loses its
  // own entry to a higher-precedence type the caller did not request.
  return deduplicateHolidays(matched);
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
