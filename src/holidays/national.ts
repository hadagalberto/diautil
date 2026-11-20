/**
 * Brazilian national holidays and federal "ponto facultativo" dates.
 *
 * Every rule below is sourced from an official norm. Law numbers were checked
 * against Planalto/Câmara texts; nothing is included that cannot be cited.
 * Lei 662/1949 originally listed 01/01, 01/05, 07/09, 15/11 and 25/12.
 * Lei 10.607/2002 gave art. 1º its current wording, adding 21/04 and 02/11.
 * Lei 6.802/1980 added 12/10. Lei 14.759/2023 added 20/11 from 2024.
 * Carnaval, Ash Wednesday and Corpus Christi are NOT national holidays: they
 * are "ponto facultativo" dates set by annual federal decree.
 *
 * Official texts checked:
 * - Lei 662/1949: http://www.planalto.gov.br/ccivil_03/leis/l0662.htm
 * - Lei 1.266/1950 and Lei 10.607/2002: https://www.planalto.gov.br/ccivil_03/leis/2002/l10607.htm
 * - Lei 6.802/1980: http://www.planalto.gov.br/ccivil_03/leis/l6802.htm
 * - Lei 14.759/2023: https://planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14759.htm
 */
import { MIN_YEAR } from '../plain-date.js';
import type { HolidayRule } from './types.js';

const SOURCE_LEI_662 = 'http://www.planalto.gov.br/ccivil_03/leis/l0662.htm';
const SOURCE_LEI_10607 = 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10607.htm';

const LEI_662 =
  'Lei nº 662, de 6 de abril de 1949, art. 1º (redação dada pela Lei nº 10.607, de 19 de dezembro de 2002)';
const PONTO_FACULTATIVO =
  'Ponto facultativo no serviço público federal, fixado anualmente por decreto da Presidência da República; não é feriado nacional (Lei nº 662/1949, art. 1º)';

/** Law that allows municipalities to declare Good Friday as a religious holiday. */
export const CUSTOMARY_GOOD_FRIDAY_LAW =
  'Lei nº 9.093, de 12 de setembro de 1995, art. 2º (Sexta-feira da Paixão de Cristo: feriado religioso municipal)';

/** Official Planalto text of Lei 9.093/1995. */
export const CUSTOMARY_GOOD_FRIDAY_SOURCE = 'https://www.planalto.gov.br/ccivil_03/leis/l9093.htm';

/**
 * Optional, opt-in "common sense" national list. Good Friday is NOT a legal
 * national holiday, so it is kept out of `nationalRules`; callers who want it
 * in the national calendar pass `includeCustomaryNational: true`.
 */
export const customaryNationalRules: readonly HolidayRule[] = [
  {
    kind: 'easter',
    id: 'good-friday-customary',
    namePt: 'Sexta-feira da Paixão (costumeiro nacional)',
    nameEn: 'Good Friday (customary national)',
    type: 'national',
    law: CUSTOMARY_GOOD_FRIDAY_LAW,
    source: CUSTOMARY_GOOD_FRIDAY_SOURCE,
    since: MIN_YEAR,
    offset: -2,
    note: 'Incluído apenas com includeCustomaryNational: true. Não é feriado nacional legal: Lei nº 9.093/1995, art. 2º permite aos municípios declará-lo como feriado religioso. É, porém, dia não útil no calendário bancário (B3/ANBIMA/BCB/FEBRABAN).',
  },
];

export const nationalRules: readonly HolidayRule[] = [
  {
    kind: 'fixed',
    id: 'new-year',
    namePt: 'Confraternização Universal',
    nameEn: 'Universal Fraternity Day (New Year)',
    type: 'national',
    law: LEI_662,
    source: SOURCE_LEI_662,
    since: 1950,
    month: 1,
    day: 1,
  },
  {
    kind: 'fixed',
    id: 'tiradentes',
    namePt: 'Dia de Tiradentes',
    nameEn: 'Tiradentes Day',
    type: 'national',
    // Lei 1.266/1950, art. 3º declared 21/04 a national holiday; Lei 10.607/2002
    // revoked that law and reinserted the date into Lei 662/1949, art. 1º.
    law: 'Lei nº 1.266, de 8 de dezembro de 1950, art. 3º; Lei nº 10.607/2002, art. 1º',
    source: SOURCE_LEI_10607,
    since: 1951,
    month: 4,
    day: 21,
  },
  {
    kind: 'fixed',
    id: 'labour-day',
    namePt: 'Dia do Trabalho',
    nameEn: 'Labour Day',
    type: 'national',
    law: LEI_662,
    source: SOURCE_LEI_662,
    since: 1949,
    month: 5,
    day: 1,
  },
  {
    kind: 'fixed',
    id: 'independence-day',
    namePt: 'Dia da Independência',
    nameEn: 'Independence Day',
    type: 'national',
    law: LEI_662,
    source: SOURCE_LEI_662,
    since: 1949,
    month: 9,
    day: 7,
  },
  {
    kind: 'fixed',
    id: 'our-lady-of-apparecida',
    namePt: 'Dia de Nossa Senhora Aparecida',
    nameEn: 'Our Lady of Aparecida Day',
    type: 'national',
    law: 'Lei nº 6.802, de 30 de junho de 1980',
    source: 'http://www.planalto.gov.br/ccivil_03/leis/l6802.htm',
    since: 1980,
    month: 10,
    day: 12,
  },
  {
    kind: 'fixed',
    id: 'all-souls-day',
    namePt: 'Dia de Finados',
    nameEn: 'All Souls Day',
    type: 'national',
    law: 'Lei nº 10.607, de 19 de dezembro de 2002, art. 1º',
    source: SOURCE_LEI_10607,
    since: 2003,
    month: 11,
    day: 2,
  },
  {
    kind: 'fixed',
    id: 'black-consciousness-day',
    namePt: 'Dia Nacional de Zumbi e da Consciência Negra',
    nameEn: 'Zumbi and Black Consciousness Day',
    type: 'national',
    // Before 2024 this was a commemorative date only, never a national holiday.
    law: 'Lei nº 14.759, de 21 de dezembro de 2023',
    source: 'https://planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14759.htm',
    since: 2024,
    month: 11,
    day: 20,
    note: 'Feriado nacional a partir de 2024; em 2023 a data não era feriado nacional.',
  },
  {
    kind: 'fixed',
    id: 'republic-proclamation-day',
    namePt: 'Proclamação da República',
    nameEn: 'Proclamation of the Republic',
    type: 'national',
    law: LEI_662,
    source: SOURCE_LEI_662,
    since: 1949,
    month: 11,
    day: 15,
  },
  {
    kind: 'fixed',
    id: 'christmas',
    namePt: 'Natal',
    nameEn: 'Christmas Day',
    type: 'national',
    law: LEI_662,
    source: SOURCE_LEI_662,
    since: 1949,
    month: 12,
    day: 25,
  },
  {
    kind: 'easter',
    id: 'carnaval-monday',
    namePt: 'Segunda-feira de Carnaval',
    nameEn: 'Carnaval Monday',
    type: 'optional',
    law: PONTO_FACULTATIVO,
    source: SOURCE_LEI_662,
    since: MIN_YEAR,
    offset: -48,
  },
  {
    kind: 'easter',
    id: 'carnaval-tuesday',
    namePt: 'Terça-feira de Carnaval',
    nameEn: 'Carnaval Tuesday',
    type: 'optional',
    law: PONTO_FACULTATIVO,
    source: SOURCE_LEI_662,
    since: MIN_YEAR,
    offset: -47,
  },
  {
    kind: 'easter',
    id: 'ash-wednesday',
    namePt: 'Quarta-Feira de Cinzas',
    nameEn: 'Ash Wednesday',
    type: 'optional',
    law: PONTO_FACULTATIVO,
    source: SOURCE_LEI_662,
    since: MIN_YEAR,
    offset: -46,
    note: 'Ponto facultativo até as 14h no serviço público federal.',
  },
  {
    kind: 'easter',
    id: 'corpus-christi',
    namePt: 'Corpus Christi',
    nameEn: 'Corpus Christi',
    type: 'optional',
    law: PONTO_FACULTATIVO,
    source: SOURCE_LEI_662,
    since: MIN_YEAR,
    offset: 60,
  },
];
