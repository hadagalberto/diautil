# Banking calendar — sources and scope

`calendar: 'bancario'` is the interbank-settlement calendar used by the settlement helpers.

## Rule

A date is **not** a banking business day when it is:

1. a Saturday or Sunday;
2. a Brazilian national holiday (with its `since`/`until` year validity); or
3. Carnaval Monday or Carnaval Tuesday (Easter −48 / −47).

All other dates are banking business days. `uf`, `city`, `extraHolidays` and `removeHolidays`
work the same way as in the civil calendar, so regional or institution-specific closures can be
layered on top.

## Sources (checked, not invented)

| Rule                                                                                                      | Citation                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Federal holidays are not business days for the financial market and for BCB reporting, including weekends | **Resolução CMN nº 4.880, de 23 de dezembro de 2020** — quoted on the FEBRABAN calendar page: https://feriadosbancarios.febraban.org.br                                                                                                                                                                  |
| No banking business on Carnaval Monday and Tuesday                                                        | FEBRABAN, "Febraban informa sobre o expediente bancário durante o Carnaval": https://portal.febraban.org.br/noticia/4421/pt-br                                                                                                                                                                           |
| Interbank settlement in D+1 business days                                                                 | FEBRABAN, "O boleto bancário [...] liquidação interbancária [...] D+1 (em um dia útil)": https://portal.febraban.org.br/noticia/4072/pt-br                                                                                                                                                               |
| Boleto maturing on a non-business day may be paid on the next business day without default interest       | **Lei nº 7.089, de 23 de março de 1983, art. 1º** — http://www.planalto.gov.br/ccivil_03/leis/l7089.htm ("Fica proibida a cobrança de juros de mora [...] sobre títulos de qualquer natureza, cujo vencimento se dê em sábado, domingo ou feriado, desde que seja quitado no primeiro dia subsequente.") |
| Same rule, explained for consumers                                                                        | Banco Central do Brasil, FAQ: https://www.bcb.gov.br/meubc/faqs/p/boleto-com-vencimento-em-dia-nao-util-e-boleto-vencido                                                                                                                                                                                 |

## Deliberate scope

The full public FEBRABAN table also lists Good Friday and Corpus Christi among the days without
banking service. This library implements the narrower rule defined in `SPEC.md` — national
holidays plus Carnaval Monday/Tuesday — because those are the two categories that can be derived
from a stable legal rule (CMN 4.880/2020) and a documented FEBRABAN notice. Callers that need the
wider table can add the extra dates explicitly:

```ts
import { createCalendar, easterSunday, addDays } from 'diautil';

function bankingWithGoodFriday(year: number) {
  const yearEaster = easterSunday(year);
  return createCalendar({
    calendar: 'bancario',
    extraHolidays: [addDays(yearEaster, -2), addDays(yearEaster, 60)],
  });
}
```

Ash Wednesday is a half-day (`ponto facultativo` until 14h) rather than a full closure and is
therefore not modelled as a non-business day.
