/**
 * Settlement helpers for boletos and interbank liquidity (D+1 / D+2).
 *
 * These default to the banking calendar because settlement dates are defined
 * in terms of interbank business days.
 *
 * Sources checked:
 * - Lei nº 7.089, de 23 de março de 1983, art. 1º — forbids banks from charging
 *   default interest on titles maturing on a Saturday, Sunday or holiday when
 *   they are paid "no primeiro dia subsequente".
 *   http://www.planalto.gov.br/ccivil_03/leis/l7089.htm
 * - Banco Central do Brasil, FAQ "Boleto com vencimento em dia não útil e boleto
 *   vencido": https://www.bcb.gov.br/meubc/faqs/p/boleto-com-vencimento-em-dia-nao-util-e-boleto-vencido
 * - FEBRABAN, "O boleto bancário [...] liquidação interbancária [...] D+1 (em um
 *   dia útil)": https://portal.febraban.org.br/noticia/4072/pt-br
 */
import type { PlainDate } from '../plain-date.js';
import type { DateInput } from '../holidays/index.js';
import { createCalendar } from './calendar.js';
import type { Calendar, CalendarKind, CalendarOptions } from './types.js';

/** Statutory basis used by `boletoDueDateAdjust`. */
export const BOLETO_DUE_DATE_LAW = 'Lei nº 7.089, de 23 de março de 1983, art. 1º';

/** Official text of the boleto due-date rule. */
export const BOLETO_DUE_DATE_SOURCE = 'http://www.planalto.gov.br/ccivil_03/leis/l7089.htm';

/** FEBRABAN explanation of D+0/D+1 interbank settlement. */
export const SETTLEMENT_SOURCE = 'https://portal.febraban.org.br/noticia/4072/pt-br';

function settlementCalendar(options: CalendarOptions): Calendar {
  const calendar: CalendarKind = options.calendar ?? 'bancario';
  return createCalendar({
    calendar,
    ...(options.uf === undefined ? {} : { uf: options.uf }),
    ...(options.city === undefined ? {} : { city: options.city }),
    ...(options.include === undefined ? {} : { include: options.include }),
    ...(options.weekends === undefined ? {} : { weekends: options.weekends }),
    ...(options.extraHolidays === undefined ? {} : { extraHolidays: options.extraHolidays }),
    ...(options.removeHolidays === undefined ? {} : { removeHolidays: options.removeHolidays }),
    ...(options.timeZone === undefined ? {} : { timeZone: options.timeZone }),
  });
}

/**
 * Adjust a boleto due date falling on a non-business day to the next business
 * day. A due date that is already a business day is returned unchanged.
 */
export function boletoDueDateAdjust(date: DateInput, options: CalendarOptions = {}): PlainDate {
  return settlementCalendar(options).addBusinessDays(date, 0, { roll: 'forward' });
}

/**
 * Interbank settlement date `D+n` counted in banking business days.
 * `n` must be a non-negative integer (`0` rolls a non-business date forward).
 */
export function settlementDate(
  date: DateInput,
  n: number,
  options: CalendarOptions = {},
): PlainDate {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`settlement days must be a non-negative integer, got ${String(n)}`);
  }
  const calendar = settlementCalendar(options);
  return n === 0
    ? calendar.addBusinessDays(date, 0, { roll: 'forward' })
    : calendar.addBusinessDays(date, n);
}

/** Settlement on the first banking business day after `date`. */
export function settlementD1(date: DateInput, options: CalendarOptions = {}): PlainDate {
  return settlementDate(date, 1, options);
}

/** Settlement on the second banking business day after `date`. */
export function settlementD2(date: DateInput, options: CalendarOptions = {}): PlainDate {
  return settlementDate(date, 2, options);
}
