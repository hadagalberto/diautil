# diautil

Brazilian holidays and business-day calendar for TypeScript/JavaScript. Every rule cites its
legal source. Zero runtime dependencies, ESM + CJS, strict TypeScript.

> Includes the date model, Easter and movable dates, the declarative rule engine, national/state
> and 27-capital municipal holidays, business-day arithmetic, civil and banking calendars,
> settlement helpers and the CLI.

## Date model

Internally diautil uses plain calendar dates, never timezone-dependent `Date` math:

```ts
type PlainDate = { readonly year: number; readonly month: number; readonly day: number };
```

Supported range: proleptic Gregorian years **1900–2199**. At the API boundary, `Date` objects are
interpreted in **America/Sao_Paulo** by default (configurable in `fromDate`/`toDate`), and strict
`YYYY-MM-DD` strings are accepted. Weekdays are computed arithmetically (0 = Sunday).

```ts
import { dayOfWeek, fromDate, fromISO, plainDate, toISO } from 'diautil';

const easter = fromISO('2024-03-31');
dayOfWeek(easter); // 0 (Sunday)
toISO(plainDate(2024, 2, 29)); // '2024-02-29'
fromDate(new Date('2024-01-01T02:00:00Z')); // { year: 2023, month: 12, day: 31 }
```

## Holidays

```ts
import { holidays, isHoliday, holidayName, nextHoliday, toISO } from 'diautil';

holidays(2026).map(toISO);
// ['2026-01-01', '2026-04-21', '2026-05-01', '2026-09-07',
//  '2026-10-12', '2026-11-02', '2026-11-15', '2026-11-20', '2026-12-25']

isHoliday('2023-11-20'); // false — not a national holiday in 2023
isHoliday('2024-11-20'); // true  — Lei 14.759/2023
holidayName('2024-11-20'); // 'Dia Nacional de Zumbi e da Consciência Negra'
holidayName('2024-11-20', {}, 'en'); // 'Zumbi and Black Consciousness Day'
nextHoliday('2024-11-20')?.date; // { year: 2024, month: 12, day: 25 }
```

`holidays()` defaults to `national` holidays. Carnaval Monday/Tuesday, Ash Wednesday and Corpus
Christi are **ponto facultativo**, not national holidays; include them explicitly:

```ts
holidays(2026, { include: ['optional'] }).map(toISO);
// ['2026-02-16', '2026-02-17', '2026-02-18', '2026-06-04']
```

Easter uses the Meeus/Jones/Butcher (Anonymous Gregorian) algorithm. Derived dates: Carnaval
Monday/Tuesday (Easter −48/−47), Ash Wednesday (−46), Good Friday (−2), Corpus Christi (+60).

### State and capital-city calendars

The calendar is the union of the selected scopes. Pass `uf` to add a state's holidays and `city`
to add a capital's municipal holidays; `include` filters by type. With no scope, the calendar stays
national-only. Capital names are matched case- and accent-insensitively.

```ts
import { holidays, isHoliday, holidayName, nextHoliday } from 'diautil';

holidays(2026, { uf: 'SP' }); // national + São Paulo state holidays
holidays(2026, { city: 'São Paulo' }); // national + São Paulo city holidays
holidays(2026, { uf: 'RJ', city: 'Rio de Janeiro' }); // all three scopes
isHoliday('2026-04-23', { uf: 'RJ' }); // São Jorge — true
holidayName('2026-04-23', { uf: 'RJ' }, 'en'); // 'Saint George Day'
nextHoliday('2026-01-25', { city: 'São Paulo' })?.date;
```

Only holidays verified against an official source (state legislature/government or prefeitura)
are included, each carrying its law number and source URL in the rule metadata and in code
comments. Anything that could not be verified is recorded in [`docs/unverified.md`](docs/unverified.md)
instead of being guessed.

### Legal sources

| Date  | Holiday                    | Source                                            |
| ----- | -------------------------- | ------------------------------------------------- |
| 01/01 | Confraternização Universal | Lei 662/1949, art. 1º (redação Lei 10.607/2002)   |
| 21/04 | Tiradentes                 | Lei 1.266/1950, art. 3º; Lei 10.607/2002, art. 1º |
| 01/05 | Dia do Trabalho            | Lei 662/1949, art. 1º (redação Lei 10.607/2002)   |
| 07/09 | Independência              | Lei 662/1949, art. 1º (redação Lei 10.607/2002)   |
| 12/10 | Nossa Senhora Aparecida    | Lei 6.802/1980                                    |
| 02/11 | Finados                    | Lei 10.607/2002, art. 1º                          |
| 15/11 | Proclamação da República   | Lei 662/1949, art. 1º (redação Lei 10.607/2002)   |
| 20/11 | Zumbi e Consciência Negra  | Lei 14.759/2023 — national from 2024              |
| 25/12 | Natal                      | Lei 662/1949, art. 1º (redação Lei 10.607/2002)   |

Ponto facultativo dates are set by annual federal decree; they are explicitly marked as _not_
national holidays in the rule metadata.

Every rule carries the official URL used to verify it. A representative sample of the source
table (the complete citation set lives in the rule metadata and in code comments):

| Scope                        | Holiday                             | Official source                                                                                                                                             |
| ---------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| National                     | 01/01, 01/05, 07/09, 15/11, 25/12   | [Lei 662/1949](http://www.planalto.gov.br/ccivil_03/leis/l0662.htm)                                                                                         |
| National                     | 21/04, 02/11                        | [Lei 10.607/2002](https://www.planalto.gov.br/ccivil_03/leis/2002/l10607.htm)                                                                               |
| National                     | 12/10                               | [Lei 6.802/1980](http://www.planalto.gov.br/ccivil_03/leis/l6802.htm)                                                                                       |
| National                     | 20/11 (from 2024)                   | [Lei 14.759/2023](https://planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14759.htm)                                                                      |
| Religious (municipal option) | Good Friday                         | [Lei 9.093/1995, art. 2º](https://www.planalto.gov.br/ccivil_03/leis/l9093.htm)                                                                             |
| Banking / settlement         | national holidays, no BCB reporting | [Resolução CMN 4.880/2020 via FEBRABAN](https://feriadosbancarios.febraban.org.br)                                                                          |
| Banking / settlement         | Good Friday, no clearing            | [B3 holiday calendar](https://www.b3.com.br/pt_br/solucoes/plataformas/puma-trading-system/para-participantes-e-traders/calendario-de-negociacao/feriados/) |
| State (SP)                   | 09/07                               | [Lei 9.497/1997 (Alesp)](https://www.al.sp.gov.br/legislacao/norma/9458)                                                                                    |
| Municipal (São Paulo)        | 25/01, 04/03, 06/04, 20/11          | [Lei 14.485/2007 (Câmara Municipal)](https://plpconsulta.saopaulo.sp.leg.br/Forms/MostrarArquivo?ANO=2007&DOCUMENTO=Atualizado&NUMERO=14485&TIPO=Lei)       |

State and municipal rules use official legislature/government or prefeitura sources only. Rules
whose base law could not be verified were removed and are listed in
[`docs/unverified.md`](docs/unverified.md).

### Same-date holidays

A state or municipal law may restate a national holiday (Finados on 02/11 in Teresina, for
example). The calendar returns **one entry per date**: the highest-precedence type wins
(`national > state > municipal > optional`) and the other law citations are kept in
`alsoDeclaredBy`. Nothing is silently dropped.

```ts
const finados = holidays(2026, { city: 'Teresina' }).find(
  (h) => h.date.day === 2 && h.date.month === 11,
);
finados?.type; // 'national'
finados?.alsoDeclaredBy?.[0]?.law; // 'Lei Municipal nº 2.275, de 11 de janeiro de 1994, § 1º ...'
```

### Good Friday (03/04/2026)

```ts
isHoliday('2026-04-03'); // false — no city, no law makes it national
isHoliday('2026-04-03', { city: 'São Paulo' }); // true  — municipal religious holiday
isBusinessDay('2026-04-03', { calendar: 'bancario' }); // false — no interbank settlement anywhere

holidays(2026, { includeCustomaryNational: true }); // common-sense list: adds 2026-04-03
```

Lei 9.093/1995 art. 2º lets municipalities declare Good Friday a religious holiday, so the legal
calendar needs a city to mark it. Banks and clearing houses do not operate on that date nationwide
(B3/ANBIMA/BCB/FEBRABAN), so the banking calendar marks it unconditionally. The opt-in
`includeCustomaryNational: true` flag adds a clearly-labelled customary (non-legal) national entry
for callers who want the everyday list.

## Rule engine (custom calendars)

Rules are declarative and reusable: `fixed`, `easter` offset, `nthWeekday`, and `movedToMonday`,
each with optional `since`/`until` year bounds and a mandatory `law` citation.

```ts
import { evaluateRule, toISO } from 'diautil';

const rule = {
  kind: 'nthWeekday' as const,
  id: 'example',
  namePt: 'Segunda-feira de exemplo',
  nameEn: 'Example Monday',
  type: 'state' as const,
  law: 'Lei estadual nº 0 (exemplo)',
  month: 2,
  weekday: 1,
  nth: 1,
};
const holiday = evaluateRule(rule, 2024);
```

## Business days

A business day is a date that is neither a configured weekend day (Saturday/Sunday by default)
nor a holiday in the selected calendar.

```ts
import {
  addBusinessDays,
  businessDaysBetween,
  isBusinessDay,
  lastBusinessDayOfMonth,
  nextBusinessDay,
  nthBusinessDayOfMonth,
  previousBusinessDay,
  quintoDiaUtilSalario,
  toISO,
} from 'diautil';

isBusinessDay('2026-11-20'); // false — Zumbi, national holiday since 2024
isBusinessDay('2026-11-23'); // true — Monday
addBusinessDays('2026-11-19', 1); // 2026-11-23 (skips the holiday and the weekend)
addBusinessDays('2026-11-21', 0); // 2026-11-23 (rolls forward)
addBusinessDays('2026-11-21', 0, { roll: 'backward' }); // 2026-11-19
businessDaysBetween('2026-11-19', '2026-11-25'); // 2 — open interval (a, b)
businessDaysBetween('2026-11-19', '2026-11-25', { inclusive: true }); // 4
nextBusinessDay('2026-11-19'); // 2026-11-23
previousBusinessDay('2026-11-23'); // 2026-11-19
lastBusinessDayOfMonth(2026, 12); // 2026-12-31
nthBusinessDayOfMonth(2026, 12, 5); // 2026-12-07 — 5th Mon–Fri business day of the month
nthBusinessDayOfMonth(2026, 12, -1); // 2026-12-31
quintoDiaUtilSalario(2026, 12); // 2026-12-05 — legal salary deadline (CLT art. 459, § 1º)
```

`nthBusinessDayOfMonth` always uses the calendar's weekend (Saturday and Sunday by default).
The legal salary deadline is different: per the Ministério do Trabalho's official interpretation
(Instrução Normativa SRT nº 01, de 07/11/1989, item I — reaffirmed by IN/MTP nº 2/2021), Saturday
**counts** and only Sundays and holidays (including municipal ones) are excluded. For that reason
`quintoDiaUtilSalario` ignores a `weekends` option and fixes the weekend to Sunday only;
December 2026 therefore yields `2026-12-05` for the salary deadline but `2026-12-07` for the
ordinary Mon–Fri count. Source:
[gov.br/MTE IN nº 2/2021](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/areas-de-atuacao/documentos-pdf/in-2-de-8-denovembro-de-2021.pdf).

`addBusinessDays` accepts negative offsets, and `businessDaysBetween` is signed: swapping the
endpoints negates the result. Months and years are cached per calendar, so counting across a
century is a cache lookup plus a binary search, not a day-by-day walk.

### Custom calendars

`createCalendar` returns an immutable, cached calendar. Standalone functions accept the same
options as their second/third argument.

```ts
import { createCalendar, isBusinessDay } from 'diautil';

const calendar = createCalendar({
  uf: 'RJ',
  city: 'Rio de Janeiro',
  weekends: [0, 6],
  extraHolidays: [{ date: '2026-11-18', namePt: 'Feriado interno', law: 'Política interna' }],
  removeHolidays: ['2026-11-20'],
});
calendar.isBusinessDay('2026-11-18'); // false — extra holiday
calendar.isBusinessDay('2026-11-20'); // true — national holiday removed
```

### Banking calendar and settlement

```ts
import { boletoDueDateAdjust, settlementD1, settlementD2, isBusinessDay } from 'diautil';

isBusinessDay('2026-02-16', { calendar: 'bancario' }); // false — Carnaval Monday
boletoDueDateAdjust('2026-12-25'); // 2026-12-28 (Lei 7.089/1983, art. 1º)
settlementD1('2026-11-19'); // 2026-11-23 — D+1 interbank business day
settlementD2('2026-11-19'); // 2026-11-24
```

The banking calendar adds Carnaval Monday/Tuesday and Good Friday to the national holidays as
non-business days for interbank settlement. Sources, deliberate scope and examples are in
[`docs/banking-calendar.md`](docs/banking-calendar.md).

## CLI

```sh
diautil feriados 2026 --uf SP --cidade "São Paulo" --json
diautil util 2026-11-20 --uf RJ
diautil soma 2026-11-19 10 --calendario bancario
diautil entre 2026-01-01 2026-12-31 --uf MG
diautil quinto-dia-util 2026-12
diautil feriados 2026 --customarios --json
diautil --version
```

All commands support `--json` for machine-readable output; `entre` also accepts `--inclusive`,
and `--customarios` opts into the customary national Good Friday entry. `quinto-dia-util` prints
both the ordinary Mon–Fri date (`diaUtilSegSex`) and the legal salary date with Saturday counted
(`diaUtilSalario`). Output is pt-BR by default; `--json` is stable and machine-readable.

## Development

```sh
npm ci
npm run check   # typecheck + lint + prettier + build + coverage
```

Coverage threshold: 95% lines. CI runs on Node 20, 22 and 24. The checked-in expected table in
`tests/fixtures/national-2000-2035.json` can be regenerated with
`npm run build && node scripts/generate-expected-table.mjs` — review the diff against the cited
laws before committing.

## License

MIT © Hadagalberto Junior. See [LICENSE](LICENSE).
