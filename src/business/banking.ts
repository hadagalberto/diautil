/**
 * Banking calendar (FEBRABAN / BCB practice for interbank settlement).
 *
 * Scope, per SPEC: the national holiday set plus Carnaval Monday and Tuesday
 * as non-business days. This is deliberately narrower than the full public
 * FEBRABAN table (which also lists Good Friday and Corpus Christi); callers
 * that need those dates can add them with `createCalendar({ extraHolidays })`.
 *
 * Sources checked (no law number is invented here):
 * - Resolução CMN nº 4.880, de 23 de dezembro de 2020: federal holidays are not
 *   business days for financial-market operations and for reporting to BCB,
 *   including Saturdays and Sundays. Quoted by FEBRABAN on its calendar page.
 * - FEBRABAN, "Feriados Bancários": https://feriadosbancarios.febraban.org.br
 * - FEBRABAN, "Febraban informa sobre o expediente bancário durante o Carnaval":
 *   https://portal.febraban.org.br/noticia/4421/pt-br
 *   ("Os bancos não terão atendimento presencial ao público nas agências nos
 *   dias 16 de fevereiro (segunda-feira), e 17 de fevereiro (terça-feira)").
 */
import { compareDates, toISO } from '../plain-date.js';
import { addDays } from '../plain-date.js';
import { easterSunday } from '../easter.js';
import { holidays, type HolidayOptions } from '../holidays/index.js';
import type { Holiday, HolidayType } from '../holidays/types.js';

/** Norm that makes federal holidays non-business days for the financial market. */
export const BANKING_LAW = 'Resolução CMN nº 4.880, de 23 de dezembro de 2020';

/** Official FEBRABAN page listing bank holidays and the CMN resolution note. */
export const BANKING_SOURCE = 'https://feriadosbancarios.febraban.org.br';

/** Human-readable explanation shipped with banking calendar metadata. */
export const BANKING_NOTE =
  'Dias sem expediente bancário para liquidação interbancária: feriados nacionais e Segunda/Terça de Carnaval (FEBRABAN/BCB).';

function carnavalHoliday(
  year: number,
  offset: number,
  id: string,
  namePt: string,
  nameEn: string,
): Holiday {
  return {
    id,
    date: addDays(easterSunday(year), offset),
    namePt,
    nameEn,
    type: 'optional',
    law: `${BANKING_LAW}; FEBRABAN — Feriados Bancários (Carnaval)`,
    source: BANKING_SOURCE,
    note: BANKING_NOTE,
  };
}

/**
 * Holidays of the banking calendar for `year`: national (and optionally the
 * requested scope) holidays plus Carnaval Monday/Tuesday.
 */
export function bankingHolidays(year: number, options: HolidayOptions = {}): Holiday[] {
  const forcedInclude: readonly HolidayType[] | undefined =
    options.include === undefined
      ? undefined
      : Array.from(new Set<HolidayType>([...options.include, 'national']));
  const baseOptions: HolidayOptions = {
    ...(options.uf === undefined ? {} : { uf: options.uf }),
    ...(options.city === undefined ? {} : { city: options.city }),
    ...(forcedInclude === undefined ? {} : { include: forcedInclude }),
  };
  const carnaval = [
    carnavalHoliday(
      year,
      -48,
      'bancario-carnaval-monday',
      'Segunda-feira de Carnaval (sem expediente bancário)',
      'Carnaval Monday (no banking business)',
    ),
    carnavalHoliday(
      year,
      -47,
      'bancario-carnaval-tuesday',
      'Terça-feira de Carnaval (sem expediente bancário)',
      'Carnaval Tuesday (no banking business)',
    ),
  ];
  // Replace any ponto-facultativo rule already present on those dates so the
  // returned metadata always carries the FEBRABAN/BCB banking citation.
  const carnavalDates = new Set<string>(carnaval.map((holiday) => toISO(holiday.date)));
  const base = holidays(year, baseOptions).filter(
    (holiday) => !carnavalDates.has(toISO(holiday.date)),
  );
  return [...base, ...carnaval].sort((a, b) => compareDates(a.date, b.date));
}
