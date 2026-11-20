/**
 * Banking calendar (FEBRABAN / B3 / ANBIMA / BCB practice for interbank settlement).
 *
 * A date is a non-business day when it is a national holiday, Carnaval Monday
 * or Tuesday, or Good Friday. Good Friday is legally a municipal religious
 * holiday (Lei 9.093/1995 art. 2º), but no banking business or interbank
 * settlement takes place on that date anywhere in Brazil.
 *
 * Sources checked (no law number is invented here):
 * - Resolução CMN nº 4.880, de 23 de dezembro de 2020: federal holidays are not
 *   business days for financial-market operations and for reporting to BCB,
 *   including Saturdays and Sundays. Quoted by FEBRABAN on its calendar page.
 * - FEBRABAN, "Feriados Bancários": https://feriadosbancarios.febraban.org.br
 * - FEBRABAN, "Febraban informa sobre o expediente bancário durante o Carnaval":
 *   https://portal.febraban.org.br/noticia/4421/pt-br
 * - B3 / ANBIMA / BCB settlement calendar: Good Friday has no banking business.
 */
import { toISO } from '../plain-date.js';
import { addDays } from '../plain-date.js';
import { easterSunday } from '../easter.js';
import { deduplicateHolidays, withAlsoDeclaredBy } from '../holidays/dedupe.js';
import { holidays, type HolidayOptions } from '../holidays/index.js';
import type { Holiday, HolidayType } from '../holidays/types.js';

/** Norm that makes federal holidays non-business days for the financial market. */
export const BANKING_LAW = 'Resolução CMN nº 4.880, de 23 de dezembro de 2020';

/** Official FEBRABAN page listing bank holidays and the CMN resolution note. */
export const BANKING_SOURCE = 'https://feriadosbancarios.febraban.org.br';

/** Official B3 rule page: no contracting, clearing or settlement on Good Friday. */
export const BANKING_GOOD_FRIDAY_SOURCE =
  'https://www.b3.com.br/pt_br/solucoes/plataformas/puma-trading-system/para-participantes-e-traders/calendario-de-negociacao/feriados/';

/** Official ANBIMA compilation of bank holidays, listing Paixão de Cristo. */
export const ANBIMA_BANK_HOLIDAYS_SOURCE = 'https://www.anbima.com.br/feriados/feriados.asp';

/** FEBRABAN 2026 bank-holiday notice citing CMN 4.880/2020 and 03/04. */
export const FEBRABAN_2026_SOURCE = 'https://portal.febraban.org.br/noticia/4413/pt-br/';

/** Human-readable explanation shipped with banking calendar metadata. */
export const BANKING_NOTE =
  'Dias sem expediente bancário para liquidação interbancária: feriados nacionais, Segunda/Terça de Carnaval e Sexta-feira da Paixão (FEBRABAN/BCB/B3/ANBIMA).';

function bankingHoliday(
  year: number,
  offset: number,
  id: string,
  namePt: string,
  nameEn: string,
  citation: string,
  source: string,
): Holiday {
  return {
    id,
    date: addDays(easterSunday(year), offset),
    namePt,
    nameEn,
    type: 'optional',
    law: `${BANKING_LAW}; ${citation}`,
    source,
    note: BANKING_NOTE,
  };
}

/**
 * Holidays of the banking calendar for `year`: national (and optionally the
 * requested scope) holidays plus Carnaval Monday/Tuesday and Good Friday.
 *
 * When a civil rule already occupies one of those dates its citation is kept
 * in `alsoDeclaredBy` instead of being dropped.
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
    ...(options.includeCustomaryNational === undefined
      ? {}
      : { includeCustomaryNational: options.includeCustomaryNational }),
  };
  const special = [
    bankingHoliday(
      year,
      -48,
      'bancario-carnaval-monday',
      'Segunda-feira de Carnaval (sem expediente bancário)',
      'Carnaval Monday (no banking business)',
      'FEBRABAN — Feriados Bancários (Carnaval)',
      BANKING_SOURCE,
    ),
    bankingHoliday(
      year,
      -47,
      'bancario-carnaval-tuesday',
      'Terça-feira de Carnaval (sem expediente bancário)',
      'Carnaval Tuesday (no banking business)',
      'FEBRABAN — Feriados Bancários (Carnaval)',
      BANKING_SOURCE,
    ),
    bankingHoliday(
      year,
      -2,
      'bancario-good-friday',
      'Sexta-feira da Paixão (sem expediente bancário)',
      'Good Friday (no banking business)',
      'B3/ANBIMA/BCB/FEBRABAN — calendário de liquidação interbancária (Sexta-feira da Paixão)',
      BANKING_GOOD_FRIDAY_SOURCE,
    ),
  ];
  // Replace any civil rule already present on a special date, preserving its
  // legal citation in `alsoDeclaredBy` instead of losing it.
  const specialDates = new Set<string>(special.map((holiday) => toISO(holiday.date)));
  const replaced = new Map<string, Holiday[]>();
  const base = holidays(year, baseOptions).filter((holiday) => {
    const iso = toISO(holiday.date);
    if (!specialDates.has(iso)) {
      return true;
    }
    const group = replaced.get(iso) ?? [];
    group.push(holiday);
    replaced.set(iso, group);
    return false;
  });
  const banking = special.map((holiday) =>
    withAlsoDeclaredBy(holiday, replaced.get(toISO(holiday.date)) ?? []),
  );
  return deduplicateHolidays([...base, ...banking]);
}
