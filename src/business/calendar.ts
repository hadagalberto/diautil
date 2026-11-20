/**
 * Business-day arithmetic built on per-year calendars.
 *
 * Each calendar caches, for every year it touches, the sorted list of
 * non-business day-of-year numbers and the set of holiday ISO strings. Counting
 * a range therefore costs one binary search per partial year plus one cheap
 * subtraction per full year — no per-day loop in `businessDaysBetween`.
 */
import {
  addDays,
  compareDates,
  dayOfWeek,
  daysInMonth,
  isLeapYear,
  plainDate,
  toISO,
  type PlainDate,
  type Weekday,
} from '../plain-date.js';
import { canonicalCapital } from '../holidays/geo.js';
import {
  holidays,
  rulesForOptions,
  toPlainDate,
  type DateInput,
  type HolidayOptions,
} from '../holidays/index.js';
import type { Holiday } from '../holidays/types.js';
import { bankingHolidays } from './banking.js';
import type {
  AddBusinessDaysOptions,
  BusinessDayOptions,
  BusinessDaysBetweenOptions,
  Calendar,
  CalendarKind,
  CalendarOptions,
  CustomHoliday,
  ExtraHoliday,
} from './types.js';

/** Saturday and Sunday, expressed with 0 = Sunday. */
export const DEFAULT_WEEKENDS: readonly Weekday[] = [0, 6];

/**
 * Legal basis for the salary-payment deadline's "business day" count.
 *
 * CLT art. 459, § 1º sets the deadline at the 5th business day of the month
 * following the worked month. The Ministério do Trabalho's official
 * interpretation (Instrução Normativa SRT nº 01, de 07/11/1989, item I) counts
 * Saturday as a business day and excludes Sundays and holidays — including
 * municipal holidays — for this specific purpose. The same reading is restated
 * in the current official norms (IN/MTP nº 2, de 08/11/2021 and IN/MTE/SIT nº 2,
 * de 03/04/2025), both hosted on gov.br.
 */
export const QUINTO_DIA_SALARIO_LAW =
  'CLT art. 459, § 1º (Lei nº 7.855/1989); Instrução Normativa SRT nº 01, de 07 de novembro de 1989, item I: "na contagem dos dias será incluído o sábado, excluindo-se o domingo e o feriado, inclusive o municipal"';

/** Official gov.br/MTE text confirming Saturday counts for salary payment. */
export const QUINTO_DIA_SALARIO_SOURCE =
  'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/areas-de-atuacao/documentos-pdf/in-2-de-8-denovembro-de-2021.pdf';

interface YearData {
  readonly nonBusinessDays: readonly number[];
  readonly holidayDates: ReadonlySet<string>;
}

interface ResolvedCalendar {
  readonly kind: CalendarKind;
  readonly weekends: ReadonlySet<Weekday>;
  readonly weekendList: readonly Weekday[];
  readonly extra: readonly Holiday[];
  readonly removed: ReadonlySet<string>;
  readonly holidayOptions: HolidayOptions;
}

function isCustomHoliday(value: ExtraHoliday): value is CustomHoliday {
  const candidate: unknown = value;
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    !(candidate instanceof Date) &&
    'date' in candidate
  );
}

function customHoliday(entry: ExtraHoliday): Holiday {
  const custom = isCustomHoliday(entry) ? entry : undefined;
  const date: DateInput = isCustomHoliday(entry) ? entry.date : entry;
  const plain = toPlainDate(date);
  const namePt = custom?.namePt ?? 'Feriado personalizado';
  const nameEn = custom?.nameEn ?? 'Custom holiday';
  const law = custom?.law ?? 'createCalendar: extraHolidays';
  const source = custom?.source;
  return {
    id: `custom-${toISO(plain)}`,
    date: plain,
    namePt,
    nameEn,
    type: 'municipal',
    law,
    ...(source === undefined ? {} : { source }),
    note: 'Added through createCalendar extraHolidays.',
  };
}

function validateOptions(options: CalendarOptions): void {
  const calendar: string | undefined = options.calendar;
  if (calendar !== undefined && calendar !== 'civil' && calendar !== 'bancario') {
    throw new RangeError(`unknown calendar: ${calendar}`);
  }
  if (options.weekends !== undefined) {
    for (const weekday of options.weekends) {
      const value: number = weekday;
      if (!Number.isInteger(value) || value < 0 || value > 6) {
        throw new RangeError(`weekday must be an integer between 0 and 6, got ${String(value)}`);
      }
    }
  }
  // Reuses the holiday module's validation of `uf` and `city`.
  rulesForOptions(options);
}

function calendarKey(options: CalendarOptions): string {
  // A sentinel distinguishes "no filter" from an explicit empty filter.
  const include =
    options.include === undefined ? '*' : `[${[...options.include].sort().join(',')}]`;
  const weekends = [...(options.weekends ?? DEFAULT_WEEKENDS)].sort((a, b) => a - b).join(',');
  const extra = (options.extraHolidays ?? [])
    .map((entry) => toISO(customHoliday(entry).date))
    .sort()
    .join(',');
  const removed = (options.removeHolidays ?? [])
    .map((date) => toISO(toPlainDate(date)))
    .sort()
    .join(',');
  const city = options.city === undefined ? '' : (canonicalCapital(options.city) ?? options.city);
  return [
    options.calendar ?? 'civil',
    options.uf ?? '',
    city,
    include,
    weekends,
    extra,
    removed,
  ].join('|');
}

function resolveOptions(options: CalendarOptions): ResolvedCalendar {
  validateOptions(options);
  const weekendList: readonly Weekday[] = [
    ...new Set<Weekday>(options.weekends ?? DEFAULT_WEEKENDS),
  ];
  const weekends = new Set<Weekday>(weekendList);
  return {
    kind: options.calendar ?? 'civil',
    weekends,
    weekendList,
    extra: (options.extraHolidays ?? []).map(customHoliday),
    removed: new Set<string>(
      (options.removeHolidays ?? []).map((date) => toISO(toPlainDate(date))),
    ),
    holidayOptions: {
      ...(options.uf === undefined ? {} : { uf: options.uf }),
      ...(options.city === undefined ? {} : { city: options.city }),
      ...(options.include === undefined ? {} : { include: options.include }),
    },
  };
}

function dayOfYear(date: PlainDate): number {
  let result = date.day;
  for (let month = 1; month < date.month; month += 1) {
    result += daysInMonth(date.year, month);
  }
  return result;
}

function lengthOfYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

function weekendDayNumbers(year: number, weekends: readonly Weekday[]): number[] {
  const last = lengthOfYear(year);
  const firstWeekday = dayOfWeek(plainDate(year, 1, 1));
  const result: number[] = [];
  for (const weekday of weekends) {
    let day = 1 + ((weekday - firstWeekday + 7) % 7);
    while (day <= last) {
      result.push(day);
      day += 7;
    }
  }
  return result;
}

/** Number of weekend dates in a year, without materialising them. */
function weekendCountInYear(year: number, weekends: readonly Weekday[]): number {
  const last = lengthOfYear(year);
  const firstWeekday = dayOfWeek(plainDate(year, 1, 1));
  let count = 0;
  for (const weekday of weekends) {
    const first = 1 + ((weekday - firstWeekday + 7) % 7);
    if (first <= last) {
      count += Math.floor((last - first) / 7) + 1;
    }
  }
  return count;
}

/** First index whose value is at least `target`. */
function lowerBound(values: readonly number[], target: number): number {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if ((values[middle] ?? 0) < target) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low;
}

const calendarCache = new Map<string, Calendar>();

class CalendarImpl implements Calendar {
  readonly options: Readonly<CalendarOptions>;
  private readonly resolved: ResolvedCalendar;
  private readonly yearCache = new Map<number, YearData>();
  private readonly fullYearCache = new Map<number, number>();

  constructor(source: CalendarOptions) {
    this.resolved = resolveOptions(source);
    const city =
      source.city === undefined ? undefined : (canonicalCapital(source.city) ?? source.city);
    this.options = {
      ...(this.resolved.kind === 'civil' ? {} : { calendar: this.resolved.kind }),
      ...(source.uf === undefined ? {} : { uf: source.uf }),
      ...(city === undefined ? {} : { city }),
      ...(source.include === undefined ? {} : { include: [...source.include] }),
      ...(source.weekends === undefined ? {} : { weekends: [...this.resolved.weekendList] }),
      ...(source.extraHolidays === undefined ? {} : { extraHolidays: [...source.extraHolidays] }),
      ...(source.removeHolidays === undefined
        ? {}
        : { removeHolidays: [...source.removeHolidays] }),
    };
  }

  holidays(year: number): Holiday[] {
    return this.holidaysForYear(year);
  }

  private holidaysForYear(year: number): Holiday[] {
    const base =
      this.resolved.kind === 'bancario'
        ? bankingHolidays(year, this.resolved.holidayOptions)
        : holidays(year, this.resolved.holidayOptions);
    const kept = base.filter((holiday) => !this.resolved.removed.has(toISO(holiday.date)));
    const extra = this.resolved.extra.filter(
      (holiday) => holiday.date.year === year && !this.resolved.removed.has(toISO(holiday.date)),
    );
    return [...kept, ...extra].sort((a, b) => compareDates(a.date, b.date));
  }

  private yearData(year: number): YearData {
    const cached = this.yearCache.get(year);
    if (cached !== undefined) {
      return cached;
    }
    const holidayDates = new Set<string>();
    const holidayDays: number[] = [];
    for (const holiday of this.holidaysForYear(year)) {
      const iso = toISO(holiday.date);
      if (holidayDates.has(iso)) {
        continue;
      }
      holidayDates.add(iso);
      if (!this.resolved.weekends.has(dayOfWeek(holiday.date))) {
        holidayDays.push(dayOfYear(holiday.date));
      }
    }
    const data: YearData = {
      nonBusinessDays: [...weekendDayNumbers(year, this.resolved.weekendList), ...holidayDays].sort(
        (a, b) => a - b,
      ),
      holidayDates,
    };
    this.yearCache.set(year, data);
    return data;
  }

  isBusinessDay(date: DateInput): boolean {
    const plain = toPlainDate(date);
    const data = this.yearData(plain.year);
    return !this.resolved.weekends.has(dayOfWeek(plain)) && !data.holidayDates.has(toISO(plain));
  }

  private countInYearRange(year: number, from: number, to: number): number {
    if (from > to) {
      return 0;
    }
    const days = this.yearData(year).nonBusinessDays;
    const nonBusiness = lowerBound(days, to + 1) - lowerBound(days, from);
    return to - from + 1 - nonBusiness;
  }

  /** Fast count for a whole year: no per-day index is materialised. */
  private businessDaysInFullYear(year: number): number {
    const cached = this.fullYearCache.get(year);
    if (cached !== undefined) {
      return cached;
    }
    let nonBusiness = weekendCountInYear(year, this.resolved.weekendList);
    const seen = new Set<string>();
    for (const holiday of this.holidaysForYear(year)) {
      const iso = toISO(holiday.date);
      if (seen.has(iso)) {
        continue;
      }
      seen.add(iso);
      if (!this.resolved.weekends.has(dayOfWeek(holiday.date))) {
        nonBusiness += 1;
      }
    }
    const count = lengthOfYear(year) - nonBusiness;
    this.fullYearCache.set(year, count);
    return count;
  }

  private countInclusiveRange(start: PlainDate, end: PlainDate): number {
    if (start.year === end.year) {
      return this.countInYearRange(start.year, dayOfYear(start), dayOfYear(end));
    }
    let total = this.countInYearRange(start.year, dayOfYear(start), lengthOfYear(start.year));
    for (let year = start.year + 1; year < end.year; year += 1) {
      total += this.businessDaysInFullYear(year);
    }
    total += this.countInYearRange(end.year, 1, dayOfYear(end));
    return total;
  }

  businessDaysBetween(
    a: DateInput,
    b: DateInput,
    options: BusinessDaysBetweenOptions = {},
  ): number {
    const first = toPlainDate(a);
    const second = toPlainDate(b);
    const order = compareDates(first, second);
    if (order === 0) {
      return options.inclusive === true && this.isBusinessDay(first) ? 1 : 0;
    }
    const start = order < 0 ? first : second;
    const end = order < 0 ? second : first;
    let count = this.countInclusiveRange(start, end);
    if (options.inclusive !== true) {
      if (this.isBusinessDay(start)) {
        count -= 1;
      }
      if (this.isBusinessDay(end)) {
        count -= 1;
      }
    }
    if (count === 0) {
      return 0;
    }
    return order < 0 ? count : -count;
  }

  private stepToBusinessDay(date: PlainDate, step: 1 | -1): PlainDate {
    let current = date;
    for (;;) {
      let next: PlainDate;
      try {
        next = addDays(current, step);
      } catch {
        throw new RangeError('no business day inside the supported year range');
      }
      if (this.isBusinessDay(next)) {
        return next;
      }
      current = next;
    }
  }

  nextBusinessDay(date: DateInput): PlainDate {
    return this.stepToBusinessDay(toPlainDate(date), 1);
  }

  previousBusinessDay(date: DateInput): PlainDate {
    return this.stepToBusinessDay(toPlainDate(date), -1);
  }

  addBusinessDays(date: DateInput, n: number, options: AddBusinessDaysOptions = {}): PlainDate {
    if (!Number.isInteger(n)) {
      throw new RangeError(`n must be an integer, got ${String(n)}`);
    }
    const plain = toPlainDate(date);
    if (n === 0) {
      if (this.isBusinessDay(plain)) {
        return plain;
      }
      return (options.roll ?? 'forward') === 'forward'
        ? this.nextBusinessDay(plain)
        : this.previousBusinessDay(plain);
    }
    const step: 1 | -1 = n > 0 ? 1 : -1;
    let remaining = Math.abs(n);
    let current = plain;
    while (remaining > 0) {
      let next: PlainDate;
      try {
        next = addDays(current, step);
      } catch {
        throw new RangeError('no business day inside the supported year range');
      }
      if (this.isBusinessDay(next)) {
        remaining -= 1;
      }
      current = next;
    }
    return current;
  }

  lastBusinessDayOfMonth(year: number, month: number): PlainDate {
    return this.addBusinessDays(plainDate(year, month, daysInMonth(year, month)), 0, {
      roll: 'backward',
    });
  }

  nthBusinessDayOfMonth(year: number, month: number, nth: number): PlainDate {
    plainDate(year, month, 1);
    if (!Number.isInteger(nth) || nth === 0) {
      throw new RangeError(`nth must be a non-zero integer, got ${String(nth)}`);
    }
    const last = daysInMonth(year, month);
    let seen = 0;
    if (nth > 0) {
      for (let day = 1; day <= last; day += 1) {
        const candidate = plainDate(year, month, day);
        if (this.isBusinessDay(candidate)) {
          seen += 1;
          if (seen === nth) {
            return candidate;
          }
        }
      }
    } else {
      for (let day = last; day >= 1; day -= 1) {
        const candidate = plainDate(year, month, day);
        if (this.isBusinessDay(candidate)) {
          seen += 1;
          if (seen === -nth) {
            return candidate;
          }
        }
      }
    }
    throw new RangeError(
      `month ${String(year)}-${String(month).padStart(2, '0')} has fewer than ${String(Math.abs(nth))} business days`,
    );
  }
}

/** Create (or reuse) an immutable calendar for the given options. */
export function createCalendar(options: CalendarOptions = {}): Calendar {
  const key = calendarKey(options);
  const cached = calendarCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const created = new CalendarImpl(options);
  calendarCache.set(key, created);
  return created;
}

/** True when `date` is a business day of the default civil calendar. */
export function isBusinessDay(date: DateInput, options: BusinessDayOptions = {}): boolean {
  return createCalendar(options).isBusinessDay(date);
}

/** Move `n` business days in the calendar described by `options`. */
export function addBusinessDays(
  date: DateInput,
  n: number,
  options: BusinessDayOptions = {},
): PlainDate {
  return createCalendar(options).addBusinessDays(
    date,
    n,
    options.roll === undefined ? {} : { roll: options.roll },
  );
}

/** Signed count of business days; exclusive counts the open interval `(a, b)`. */
export function businessDaysBetween(
  a: DateInput,
  b: DateInput,
  options: BusinessDayOptions = {},
): number {
  return createCalendar(options).businessDaysBetween(
    a,
    b,
    options.inclusive === undefined ? {} : { inclusive: options.inclusive },
  );
}

/** First business day strictly after `date`. */
export function nextBusinessDay(date: DateInput, options: BusinessDayOptions = {}): PlainDate {
  return createCalendar(options).nextBusinessDay(date);
}

/** Last business day strictly before `date`. */
export function previousBusinessDay(date: DateInput, options: BusinessDayOptions = {}): PlainDate {
  return createCalendar(options).previousBusinessDay(date);
}

/** Last business day of a month. */
export function lastBusinessDayOfMonth(
  year: number,
  month: number,
  options: BusinessDayOptions = {},
): PlainDate {
  return createCalendar(options).lastBusinessDayOfMonth(year, month);
}

/** Nth business day of a month; negative `nth` counts from the end. */
export function nthBusinessDayOfMonth(
  year: number,
  month: number,
  nth: number,
  options: BusinessDayOptions = {},
): PlainDate {
  return createCalendar(options).nthBusinessDayOfMonth(year, month, nth);
}

/**
 * 5º dia útil para pagamento de salário (CLT art. 459, § 1º).
 *
 * Different from `nthBusinessDayOfMonth`: for this legal deadline Saturday is
 * a business day, while Sundays and holidays (including municipal ones) are
 * not, per Instrução Normativa SRT nº 01/1989, item I. A `weekends` option is
 * therefore ignored — the legal rule fixes the weekend as Sunday only.
 *
 * @see QUINTO_DIA_SALARIO_LAW and QUINTO_DIA_SALARIO_SOURCE.
 */
export function quintoDiaUtilSalario(
  year: number,
  month: number,
  options: BusinessDayOptions = {},
): PlainDate {
  return createCalendar({ ...options, weekends: [0] }).nthBusinessDayOfMonth(year, month, 5);
}

/** Holidays of the configured calendar for a year (useful for inspection). */
export function calendarHolidays(year: number, options: BusinessDayOptions = {}): Holiday[] {
  return createCalendar(options).holidays(year);
}
