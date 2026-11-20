# Banking calendar — sources and scope

`calendar: 'bancario'` is the interbank-settlement calendar used by the settlement helpers.

## Rule

A date is **not** a banking business day when it is:

1. a Saturday or Sunday;
2. a Brazilian national holiday (with its `since`/`until` year validity);
3. Carnaval Monday or Carnaval Tuesday (Easter −48 / −47); or
4. **Good Friday (Sexta-feira da Paixão, Easter −2)**, in every city and state.

All other dates are banking business days. `uf`, `city`, `extraHolidays` and `removeHolidays`
work the same way as in the civil calendar, so regional or institution-specific closures can be
layered on top.

## Why `isHoliday` and `isBusinessDay` disagree on 03/04

```ts
isHoliday('2026-04-03'); // false — not a legal national holiday
isHoliday('2026-04-03', { city: 'São Paulo' }); // true  — municipal religious holiday
isBusinessDay('2026-04-03'); // true  — civil Friday
isBusinessDay('2026-04-03', { calendar: 'bancario' }); // false — no interbank settlement
```

Lei nº 9.093/1995, art. 2º allows municipalities to declare Good Friday a religious holiday; it
does **not** create a national holiday. That is why the legal calendar needs a city to return
`true`. The financial system, on the other hand, has no banking business or interbank settlement
on that date anywhere in Brazil, so the banking calendar marks it unconditionally. A third,
opt-in view is available for callers who want the common-sense national list:

```ts
holidays(2026, { includeCustomaryNational: true }); // adds 2026-04-03
```

The optional rule is explicitly labelled as customary (not legal) and cites Lei 9.093/1995.

## Sources (checked, not invented)

| Rule                                                                                                      | Citation                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Federal holidays are not business days for the financial market and for BCB reporting, including weekends | **Resolução CMN nº 4.880, de 23 de dezembro de 2020** — quoted on the FEBRABAN calendar page: https://feriadosbancarios.febraban.org.br                                                                                                                                                                  |
| No banking business on Carnaval Monday and Tuesday                                                        | FEBRABAN, "Febraban informa sobre o expediente bancário durante o Carnaval": https://portal.febraban.org.br/noticia/4421/pt-br                                                                                                                                                                           |
| No clearing/settlement on Good Friday                                                                     | B3, "Calendário de negociação — Feriados": https://www.b3.com.br/pt_br/solucoes/plataformas/puma-trading-system/para-participantes-e-traders/calendario-de-negociacao/feriados/ ; FEBRABAN 2026 bank holidays (cites CMN 4.880): https://portal.febraban.org.br/noticia/4413/pt-br/                      |
| ANBIMA bank-holiday compilation listing Paixão de Cristo                                                  | https://www.anbima.com.br/feriados/feriados.asp                                                                                                                                                                                                                                                          |
| Good Friday is a municipal religious holiday, not a national one                                          | **Lei nº 9.093, de 12 de setembro de 1995, art. 2º**: https://www.planalto.gov.br/ccivil_03/leis/l9093.htm                                                                                                                                                                                               |
| Interbank settlement in D+1 business days                                                                 | FEBRABAN, "O boleto bancário [...] liquidação interbancária [...] D+1 (em um dia útil)": https://portal.febraban.org.br/noticia/4072/pt-br                                                                                                                                                               |
| Boleto maturing on a non-business day may be paid on the next business day without default interest       | **Lei nº 7.089, de 23 de março de 1983, art. 1º** — http://www.planalto.gov.br/ccivil_03/leis/l7089.htm ("Fica proibida a cobrança de juros de mora [...] sobre títulos de qualquer natureza, cujo vencimento se dê em sábado, domingo ou feriado, desde que seja quitado no primeiro dia subsequente.") |
| Same rule, explained for consumers                                                                        | Banco Central do Brasil, FAQ: https://www.bcb.gov.br/meubc/faqs/p/boleto-com-vencimento-em-dia-nao-util-e-boleto-vencido                                                                                                                                                                                 |

## Deduplication of same-date holidays

When a state or municipal law restates a national holiday (e.g. Finados on 02/11 in Teresina), the
calendar returns a single entry. Precedence is `national > state > municipal > optional`; the
losing citations are preserved in `Holiday.alsoDeclaredBy`, so no legal source is discarded.
The banking calendar applies the same merging when it replaces a civil rule on Carnaval or Good
Friday with its own FEBRABAN/B3 citation.

Ash Wednesday is a half-day (`ponto facultativo` until 14h) rather than a full closure and is
therefore not modelled as a non-business day.
