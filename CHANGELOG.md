# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project does not publish to npm.

## [Unreleased] — Milestone 6

### Fixed

- Reject incompatible `uf`/`city` scopes (e.g. RJ with São Paulo) with `RangeError` instead of
  silently mixing calendars; matching remains accent/case/whitespace insensitive.
- Added the missing `timeZone` option to `HolidayOptions` and propagated it through the holiday,
  business-day, settlement and CLI APIs. Unknown IANA zones now fail at the boundary.
- `fromISO` accepts full ISO datetimes: offset-less values use the configured zone's wall-clock
  date, offset-bearing values are converted to that zone.
- Replaced the circular `dist`-generated 2000–2035 fixture with an independent oracle (statutory
  fixed dates + Gauss Easter + a hand-written, officially cross-checked ten-year table).
- Clarified the open-interval semantics of `businessDaysBetween` and its `inclusive` option in both
  READMEs.

### Verified

- RJ Corpus Christi state holiday (Lei nº 11.002/2025) confirmed on the official Alerj text; the
  rule, its `since: 2025` boundary and its ADI 7898 note remain unchanged.

See [`docs/REVIEW-FIXES.md`](docs/REVIEW-FIXES.md) for the full regression-test report.

## [Unreleased] — Milestone 4

### Added

- `diautil` CLI: `feriados`, `util`, `soma`, `entre`, `quinto-dia-util`, `--json`, `--inclusive`,
  pt-BR text output and the new `--customarios` flag. Tests spawn the built binary.
- `README.pt-BR.md` with a full table of legal sources, plus an expanded source table in `README.md`.
- `CONTRIBUTING.md` with the verification policy for new holiday rules.
- `includeCustomaryNational: true` option: adds a labelled, non-legal national Good Friday entry
  for callers who want the common-sense holiday list.
- Good Friday is a non-business day in the `bancario` calendar in every city (B3/ANBIMA/BCB/FEBRABAN).
- Date deduplication with `Holiday.alsoDeclaredBy`: one entry per date, precedence
  `national > state > municipal > optional`, all legal citations preserved.

### Changed

- Source audit: weak URLs (news/event pages, one-off COVID date-anticipation laws, wrong-law
  slugs, one-off TRE portarias) replaced with official base-law texts for AL, AC, CE, MA, MT, PA,
  RN, Teresina, São Paulo, Porto Velho and Porto Alegre. Incorrect Acre sanction dates were
  corrected against the assembled law texts.
- Documentation explains why `isHoliday('2026-04-03')` is false without a city while
  `isBusinessDay('2026-04-03', { calendar: 'bancario' })` is false.

### Removed

- Municipal rules without a verifiable official law text (Rio Branco 28/12, Macapá 08/12,
  Campo Grande 13/06, all three Belém rules, Goiânia 24/05, all three Boa Vista rules). They are
  now recorded in `docs/unverified.md`. Verified subnational rules: 47 state + 73 municipal.

## [0.1.0] — Milestones 1–3

### Added

- Plain-date model (1900–2199) with `Date`/ISO boundary conversion in America/Sao_Paulo.
- Gregorian Easter and movable dates, declarative rule engine with year validity.
- Legal national holidays, including Lei 14.759/2023 from 2024.
- Verified state and capital-city holiday calendars.
- Business-day arithmetic, configurable weekends, custom calendars, banking calendar and
  settlement helpers (`boletoDueDateAdjust`, D+1/D+2).
- Vitest suite with fast-check properties, checked-in 2000–2035 expected table and CI for
  Node 20/22/24.
