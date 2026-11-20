/**
 * Gregorian Easter (Anonymous Gregorian / Meeus-Jones-Butcher algorithm).
 * All results are plain calendar dates; no `Date` timezone math is involved.
 */
import {
  addDays,
  dayOfWeek,
  isValidYear,
  plainDate,
  type PlainDate,
  type Weekday,
} from './plain-date.js';

/** Easter Sunday for `year` (1900-2199). */
export function easterSunday(year: number): PlainDate {
  if (!isValidYear(year)) {
    throw new RangeError(`year must be an integer between 1900 and 2199, got ${String(year)}`);
  }
  // Meeus/Jones/Butcher, also known as the Anonymous Gregorian algorithm.
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const result = plainDate(year, month, day);
  // Defensive invariant: Easter is always a Sunday in the Gregorian calendar.
  if (dayOfWeek(result) !== 0) {
    throw new Error(`internal error: computed Easter ${year} is not a Sunday`);
  }
  return result;
}

/** Date `offset` days after Easter Sunday (negative offsets go backwards). */
export function easterOffset(year: number, offset: number): PlainDate {
  return addDays(easterSunday(year), offset);
}

/** Carnaval Monday: Easter − 48 days. */
export function carnavalMonday(year: number): PlainDate {
  return easterOffset(year, -48);
}

/** Carnaval Tuesday: Easter − 47 days. */
export function carnavalTuesday(year: number): PlainDate {
  return easterOffset(year, -47);
}

/** Ash Wednesday: Easter − 46 days (ponto facultativo until 14h for federal service). */
export function ashWednesday(year: number): PlainDate {
  return easterOffset(year, -46);
}

/** Good Friday (Sexta-feira da Paixão): Easter − 2 days. */
export function goodFriday(year: number): PlainDate {
  return easterOffset(year, -2);
}

/** Corpus Christi: Easter + 60 days. */
export function corpusChristi(year: number): PlainDate {
  return easterOffset(year, 60);
}

export interface MovableDates {
  readonly carnavalMonday: PlainDate;
  readonly carnavalTuesday: PlainDate;
  readonly ashWednesday: PlainDate;
  readonly goodFriday: PlainDate;
  readonly corpusChristi: PlainDate;
  readonly easter: PlainDate;
}

/** All Easter-derived movable dates for a year, keyed by name. */
export function movableDates(year: number): MovableDates {
  return {
    carnavalMonday: carnavalMonday(year),
    carnavalTuesday: carnavalTuesday(year),
    ashWednesday: ashWednesday(year),
    goodFriday: goodFriday(year),
    corpusChristi: corpusChristi(year),
    easter: easterSunday(year),
  };
}

/** Assert a date's weekday at compile-friendly runtime cost; used by tests and callers. */
export function isWeekday(date: PlainDate, weekday: Weekday): boolean {
  return dayOfWeek(date) === weekday;
}
