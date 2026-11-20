/**
 * Plain calendar dates: no `Date` timezone math is used internally.
 * Weekday is computed arithmetically (Sakamoto), with 0 = Sunday.
 */

/** Weekday index, Sunday = 0 ... Saturday = 6. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface PlainDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** Inclusive bounds of the proleptic Gregorian range supported by diautil. */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2199;

/** Default IANA time zone used when a JavaScript `Date` crosses the API boundary. */
export const DEFAULT_TIME_ZONE = 'America/Sao_Paulo';

const MS_PER_DAY = 86_400_000;
const MONTH_LENGTHS: readonly number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const SAKAMOTO_OFFSETS: readonly number[] = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];

interface ZonedParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function assertYear(year: number): void {
  if (!isValidYear(year)) {
    throw new RangeError(
      `year must be an integer between ${MIN_YEAR} and ${MAX_YEAR}, got ${String(year)}`,
    );
  }
}

/** True when `year` is an integer inside the supported range. */
export function isValidYear(year: unknown): year is number {
  return typeof year === 'number' && Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR;
}

/** True when `year` is a leap year in the proleptic Gregorian calendar. */
export function isLeapYear(year: number): boolean {
  assertYear(year);
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Number of days in `month` (1-12) of `year`. */
export function daysInMonth(year: number, month: number): number {
  assertYear(year);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`month must be an integer between 1 and 12, got ${month}`);
  }
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return MONTH_LENGTHS[month - 1] ?? 0;
}

/** True when the three components form a valid date in the supported range. */
export function isValidPlainDate(year: unknown, month: unknown, day: unknown): boolean {
  if (
    !isValidYear(year) ||
    typeof month !== 'number' ||
    typeof day !== 'number' ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12
  ) {
    return false;
  }
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const maxDay = month === 2 && leap ? 29 : (MONTH_LENGTHS[month - 1] ?? 0);
  return day >= 1 && day <= maxDay;
}

/** Build a validated `PlainDate`. Throws `RangeError` for out-of-range components. */
export function plainDate(year: number, month: number, day: number): PlainDate {
  assertYear(year);
  if (!isValidPlainDate(year, month, day)) {
    throw new RangeError(
      `invalid date: ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    );
  }
  return { year, month, day };
}

/** Structural type guard for values arriving through untyped boundaries. */
export function isPlainDate(value: unknown): value is PlainDate {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate: Record<string, unknown> = value as Record<string, unknown>;
  const year = candidate['year'];
  const month = candidate['month'];
  const day = candidate['day'];
  return (
    typeof year === 'number' &&
    typeof month === 'number' &&
    typeof day === 'number' &&
    isValidPlainDate(year, month, day)
  );
}

/** Serialize as strict `YYYY-MM-DD`. */
export function toISO(date: PlainDate): string {
  return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

/** Parse a strict `YYYY-MM-DD` string. */
export function fromISO(iso: string): PlainDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match === null) {
    throw new RangeError(`invalid ISO date (expected YYYY-MM-DD): ${iso}`);
  }
  const year = match[1];
  const month = match[2];
  const day = match[3];
  if (year === undefined || month === undefined || day === undefined) {
    throw new RangeError(`invalid ISO date (expected YYYY-MM-DD): ${iso}`);
  }
  return plainDate(Number(year), Number(month), Number(day));
}

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatters.get(timeZone);
  if (cached !== undefined) {
    return cached;
  }
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      calendar: 'gregory',
      numberingSystem: 'latn',
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (error: unknown) {
    throw new RangeError(`invalid IANA time zone: ${timeZone}`, { cause: error });
  }
  formatters.set(timeZone, formatter);
  return formatter;
}

function partsInZone(date: Date, timeZone: string): ZonedParts {
  const raw: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of getFormatter(timeZone).formatToParts(date)) {
    if (part.type !== 'literal') {
      raw[part.type] = part.value;
    }
  }
  const year = Number(raw['year']);
  const month = Number(raw['month']);
  const day = Number(raw['day']);
  const hour = Number(raw['hour']);
  const minute = Number(raw['minute']);
  const second = Number(raw['second']);
  return { year, month, day, hour, minute, second };
}

/** Interpret a JS `Date` as a calendar date in `timeZone` (America/Sao_Paulo by default). */
export function fromDate(date: Date, timeZone: string = DEFAULT_TIME_ZONE): PlainDate {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new RangeError('fromDate expects a valid JavaScript Date');
  }
  const parts = partsInZone(date, timeZone);
  return plainDate(parts.year, parts.month, parts.day);
}

function zoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = partsInZone(instant, timeZone);
  const asUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUTC - Math.floor(instant.getTime() / 1000) * 1000;
}

/**
 * Create a JS `Date` whose calendar date in `timeZone` is `date`.
 * Noon is used so historical midnight DST transitions cannot shift the day.
 */
export function toDate(date: PlainDate, timeZone: string = DEFAULT_TIME_ZONE): Date {
  const utcNoon = Date.UTC(date.year, date.month - 1, date.day, 12);
  const firstGuess = zoneOffsetMs(new Date(utcNoon), timeZone);
  const offset = zoneOffsetMs(new Date(utcNoon - firstGuess), timeZone);
  return new Date(utcNoon - offset);
}

function toSerial(date: PlainDate): number {
  return Date.UTC(date.year, date.month - 1, date.day) / MS_PER_DAY;
}

/** Add (or subtract) whole calendar days without any timezone arithmetic. */
export function addDays(date: PlainDate, days: number): PlainDate {
  assertYear(date.year);
  if (!Number.isInteger(days)) {
    throw new RangeError(`days must be an integer, got ${days}`);
  }
  const result = new Date((toSerial(date) + days) * MS_PER_DAY);
  return plainDate(result.getUTCFullYear(), result.getUTCMonth() + 1, result.getUTCDate());
}

/** Whole days from `a` to `b` (positive when `b` is later). */
export function daysBetween(a: PlainDate, b: PlainDate): number {
  return toSerial(b) - toSerial(a);
}

/** -1, 0 or 1 when `a` is before, equal to or after `b` (sort-friendly). */
export function compareDates(a: PlainDate, b: PlainDate): number {
  const delta = toSerial(a) - toSerial(b);
  return delta < 0 ? -1 : delta > 0 ? 1 : 0;
}

/** Weekday of a plain date, 0 = Sunday ... 6 = Saturday. */
export function dayOfWeek(date: PlainDate): Weekday {
  let year = date.year;
  const month = date.month;
  if (month < 3) {
    year -= 1;
  }
  const offset = SAKAMOTO_OFFSETS[month - 1] ?? 0;
  const index =
    (year +
      Math.floor(year / 4) -
      Math.floor(year / 100) +
      Math.floor(year / 400) +
      offset +
      date.day) %
    7;
  return (((index % 7) + 7) % 7) as Weekday;
}

/**
 * Nth `weekday` of `month`. `nth` > 0 counts from the start (1 = first),
 * `nth` < 0 counts from the end (-1 = last). Throws when it does not exist.
 */
export function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: Weekday,
  nth: number,
): PlainDate {
  assertYear(year);
  if (!Number.isInteger(nth) || nth === 0 || Math.abs(nth) > 5) {
    throw new RangeError(`nth must be an integer between -5 and 5 excluding 0, got ${nth}`);
  }
  const lastDay = daysInMonth(year, month);
  if (nth > 0) {
    const firstWeekday = dayOfWeek(plainDate(year, month, 1));
    const day = 1 + ((weekday - firstWeekday + 7) % 7) + (nth - 1) * 7;
    return plainDate(year, month, day);
  }
  const lastWeekday = dayOfWeek(plainDate(year, month, lastDay));
  const day = lastDay - ((lastWeekday - weekday + 7) % 7) + (nth + 1) * 7;
  return plainDate(year, month, day);
}
