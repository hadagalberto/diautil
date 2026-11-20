/**
 * Date-level deduplication for holidays.
 *
 * A national holiday can be restated by a state or municipal law (e.g. Finados
 * on 02/11 in Teresina). The calendar must expose one entry per date: the
 * highest-precedence declaration wins and the remaining legal citations are
 * preserved in `alsoDeclaredBy`, so no source is silently lost.
 */
import { compareDates, toISO } from '../plain-date.js';
import type { Holiday, HolidayType, AlsoDeclaredBy } from './types.js';

/** Higher number wins. `optional` (ponto facultativo) is always lowest. */
const PRECEDENCE: Readonly<Record<HolidayType, number>> = {
  national: 4,
  state: 3,
  municipal: 2,
  optional: 1,
};

function citation(holiday: Holiday): AlsoDeclaredBy {
  return {
    id: holiday.id,
    namePt: holiday.namePt,
    nameEn: holiday.nameEn,
    type: holiday.type,
    law: holiday.law,
    ...(holiday.source === undefined ? {} : { source: holiday.source }),
    ...(holiday.uf === undefined ? {} : { uf: holiday.uf }),
    ...(holiday.city === undefined ? {} : { city: holiday.city }),
  };
}

/**
 * Attach extra same-date citations to a holiday without duplicating entries.
 * Used by the banking calendar when it replaces a civil rule with its own.
 */
export function withAlsoDeclaredBy(holiday: Holiday, others: readonly Holiday[]): Holiday {
  if (others.length === 0) {
    return holiday;
  }
  const seen = new Set<string>([holiday.law]);
  const merged: AlsoDeclaredBy[] = [...(holiday.alsoDeclaredBy ?? [])];
  for (const other of others) {
    const entry = citation(other);
    if (seen.has(entry.law)) {
      continue;
    }
    seen.add(entry.law);
    merged.push(entry);
  }
  return merged.length === 0 ? holiday : { ...holiday, alsoDeclaredBy: merged };
}

/** One entry per calendar date, highest precedence first, citations merged. */
export function deduplicateHolidays(items: readonly Holiday[]): Holiday[] {
  const groups = new Map<string, Holiday[]>();
  for (const holiday of items) {
    const key = toISO(holiday.date);
    const group = groups.get(key);
    if (group === undefined) {
      groups.set(key, [holiday]);
    } else {
      group.push(holiday);
    }
  }
  const result: Holiday[] = [];
  for (const group of groups.values()) {
    let winner = group[0];
    if (winner === undefined) {
      continue;
    }
    for (const candidate of group.slice(1)) {
      if (PRECEDENCE[candidate.type] > PRECEDENCE[winner.type]) {
        winner = candidate;
      }
    }
    const losers = group.filter((holiday) => holiday !== winner);
    result.push(losers.length === 0 ? winner : withAlsoDeclaredBy(winner, losers));
  }
  return result.sort((a, b) => compareDates(a.date, b.date));
}
