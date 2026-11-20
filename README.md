# diautil

Brazilian holidays and business-day calendar for TypeScript/JavaScript. Every rule cites its
legal source. Zero runtime dependencies, ESM + CJS, strict TypeScript.

> Scope so far: date model, Easter and movable dates, declarative rule engine, national/state and
> 27-capital municipal holidays, and the `feriados` CLI command. Business-day arithmetic is
> planned for a later milestone and is not part of the current API yet.

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

## CLI

```sh
diautil feriados 2026
diautil feriados 2026 --json
diautil --version
```

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
