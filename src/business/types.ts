/**
 * Public types of the business-day API. Options extend the holiday options so
 * the same `uf`/`city`/`include` scope selectors work for both APIs.
 */
import type { PlainDate, Weekday } from '../plain-date.js';
import type { DateInput, HolidayOptions } from '../holidays/index.js';
import type { Holiday } from '../holidays/types.js';

/** Calendar flavour. `bancario` adds the FEBRABAN/BCB interbank non-business days. */
export type CalendarKind = 'civil' | 'bancario';

/** What to do with a non-business date when no days are added. */
export type Roll = 'forward' | 'backward';

/** A holiday added by the caller. A bare date uses a generic label. */
export interface CustomHoliday {
  readonly date: DateInput;
  readonly namePt?: string;
  readonly nameEn?: string;
  readonly law?: string;
  readonly source?: string;
}

export type ExtraHoliday = DateInput | CustomHoliday;

export interface CalendarOptions extends HolidayOptions {
  /** Selects the civil or the banking calendar. Defaults to `civil`. */
  readonly calendar?: CalendarKind;
  /** Weekdays treated as weekend. Defaults to Saturday and Sunday. */
  readonly weekends?: readonly Weekday[];
  /** Additional non-business dates. */
  readonly extraHolidays?: readonly ExtraHoliday[];
  /** Dates removed from the calendar even when a rule marks them as a holiday. */
  readonly removeHolidays?: readonly DateInput[];
}

export interface AddBusinessDaysOptions {
  /** Roll direction used when `n` is zero and the date is not a business day. Defaults to `forward`. */
  readonly roll?: Roll;
}

export interface BusinessDaysBetweenOptions {
  /** Include both endpoints in the count. Defaults to `false` (open interval `(a, b)`). */
  readonly inclusive?: boolean;
}

/** Options accepted by the standalone convenience functions. */
export interface BusinessDayOptions
  extends CalendarOptions, AddBusinessDaysOptions, BusinessDaysBetweenOptions {}

/** An immutable, cached calendar of business days. */
export interface Calendar {
  /** Resolved options used to build this calendar. */
  readonly options: Readonly<CalendarOptions>;
  /** Holidays in `year` after custom additions/removals and banking rules. */
  holidays(year: number): Holiday[];
  /** True when `date` is neither weekend nor holiday in this calendar. */
  isBusinessDay(date: DateInput): boolean;
  /** Move `n` business days; `n = 0` rolls a non-business date per `roll`. */
  addBusinessDays(date: DateInput, n: number, options?: AddBusinessDaysOptions): PlainDate;
  /** Signed count of business days between two dates. */
  businessDaysBetween(a: DateInput, b: DateInput, options?: BusinessDaysBetweenOptions): number;
  /** First business day strictly after `date`. */
  nextBusinessDay(date: DateInput): PlainDate;
  /** Last business day strictly before `date`. */
  previousBusinessDay(date: DateInput): PlainDate;
  /** Last business day of a month. */
  lastBusinessDayOfMonth(year: number, month: number): PlainDate;
  /** Nth business day of a month (negative counts from the end). */
  nthBusinessDayOfMonth(year: number, month: number, nth: number): PlainDate;
}
