# Unverified and excluded holidays — Milestone 2

Every state and capital-city holiday shipped in this milestone is backed by an official source
(state legislature/government or prefeitura/câmara) with an exact law number and a checkable URL.
Those citations live next to each rule in [`src/holidays/state.ts`](../src/holidays/state.ts) and
[`src/holidays/municipal.ts`](../src/holidays/municipal.ts), and are also exposed on the returned
`Holiday` as `law` and `source`.

Nothing in this file is shipped as a holiday rule. Law numbers are never guessed and widely
repeated dates are not treated as verified without a primary source. The entries below were found
in secondary sources, in bills that never became law, or in norms whose classification conflicts
with the legal text.

## Coverage summary

Counts are verified rules included in the library. `0` is either a documented absence of a
dedicated feriado (MG, PR) or a structural fact (Brasília is not a municipality).

| UF  | Capital        | State rules | Municipal rules | Note                                                          |
| --- | -------------- | ----------: | --------------: | ------------------------------------------------------------- |
| AC  | Rio Branco     |           6 |               0 | 28/12 moved here: no official law text found.                 |
| AL  | Maceió         |           4 |               5 |                                                               |
| AM  | Manaus         |           1 |               6 |                                                               |
| AP  | Macapá         |           2 |               0 | Several state-law numbers unverified; 08/12 moved here.       |
| BA  | Salvador       |           1 |               2 | State basis is the state constitution.                        |
| CE  | Fortaleza      |           1 |               4 | Data magna is 25/03, not 19/03.                               |
| DF  | Brasília       |           5 |               0 | DF district law; no municipality exists.                      |
| ES  | Vitória        |           1 |               4 |                                                               |
| GO  | Goiânia        |           2 |               3 | Dia do Servidor is not a feriado; Lei 701/1956 moved here.    |
| MA  | São Luís       |           2 |               3 | Corpus Christi legally a feriado, administratively contested. |
| MG  | Belo Horizonte |           0 |               4 | No state feriado beyond national Tiradentes.                  |
| MS  | Campo Grande   |           1 |               2 | Lei 3.901/2001 (13/06) moved here.                            |
| MT  | Cuiabá         |           1 |               3 |                                                               |
| PA  | Belém          |           1 |               0 | Enabling municipal law numbers not located; all moved here.   |
| PB  | João Pessoa    |           1 |               2 |                                                               |
| PE  | Recife         |           1 |               4 | Current law is 16.241/2017, not revoked 16.059/2017.          |
| PI  | Teresina       |           1 |               5 |                                                               |
| PR  | Curitiba       |           0 |               2 | Official state calendar lists only national feriados.         |
| RJ  | Rio de Janeiro |           4 |               1 | Corpus Christi state holiday since 2025.                      |
| RN  | Natal          |           1 |               2 | Padroeira date not confirmed at municipal level.              |
| RO  | Porto Velho    |           2 |               3 |                                                               |
| RR  | Boa Vista      |           1 |               0 | Leis 104/1984 and 1.705/2016 moved here.                      |
| RS  | Porto Alegre   |           1 |               4 | City anniversary explicitly **not** a holiday.                |
| SC  | Florianópolis  |           2 |               4 | State dates transferable to Sunday by law.                    |
| SE  | Aracaju        |           1 |               2 | Commonly cited state law number unverified.                   |
| SP  | São Paulo      |           1 |               4 |                                                               |
| TO  | Palmas         |           3 |               4 |                                                               |

**Total: 47 state rules + 73 municipal rules = 120 verified subnational rules.**

### Milestone 4 source audit

A second pass rejected sources that were news/event pages, one-off decrees that only moved a
date, or URLs pointing at a different law. Where the base law text could be confirmed on an
official legislature/government portal the citation was **replaced** (AL, AC, CE, MA, MT, PA, RN,
Teresina, São Paulo, Porto Velho, Porto Alegre). Where no official text exists the rule was
**removed from the library** and listed below. This is why Rio Branco, Macapá, Belém and Boa
Vista now ship with zero municipal rules.

## Candidates that could not be verified

| UF  | Scope                     | Candidate                                 | Claimed law                        | Status                     | Reason / source checked                                                                                                     |
| --- | ------------------------- | ----------------------------------------- | ---------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| AP  | state                     | 15/05 Cabralzinho                         | Lei 753/2003 or 2.213/2017         | conflicting-number         | No official eLegis text retrieved; two different numbers in secondary sources.                                              |
| AP  | state                     | 25/05 São Tiago                           | Lei 1.696/2012                     | no-official-source         | Number only on aggregators; official portal not located.                                                                    |
| AP  | state                     | 30/11 Evangélico (state)                  | Lei 1.134/2007                     | no-official-source         | Aggregator only; official text not retrieved.                                                                               |
| AP  | state                     | 08/12 Conceição (state)                   | Lei 340/1997                       | no-official-source         | Aggregator only; official text not retrieved.                                                                               |
| AP  | state                     | 20/11 Consciência Negra (state)           | Lei 1.169/2007                     | no-official-source         | Number unverified; date is a national holiday from 2024.                                                                    |
| AP  | municipal (Macapá)        | 04/02 aniversário                         | Lei 064/1977                       | no-official-source         | Prefeitura confirms the date but not the number.                                                                            |
| AP  | municipal (Macapá)        | 15/05 Cabralzinho                         | —                                  | no-official-source         | Prefeitura confirms the feriado but no law number found.                                                                    |
| BA  | state                     | 02/07                                     | Lei 38/1936; Lei 79/1948           | no-official-source         | Only the state constitution (art. 67 § 3º) could be verified; that is the rule shipped.                                     |
| BA  | state                     | change of 02/07 and São João dates        | Lei 14.267/2020                    | no-official-source         | Found only on non-official law aggregators.                                                                                 |
| BA  | municipal (Salvador)      | Good Friday, Corpus Christi               | Lei 1.997/1967                     | date-unconfirmed           | Official INPI table lists only 24/06 and 08/12 for Salvador.                                                                |
| CE  | state                     | 19/03 as data magna                       | PL 53/2007                         | not-a-law                  | Bill proposed 19/03; enacted EC 73/2011 fixes 25/03.                                                                        |
| CE  | municipal (Fortaleza)     | 13/04/2026 one-off "300 anos"             | PL 185/2026, not sanctioned        | not-a-law                  | Only a Câmara news item; no enacted law number.                                                                             |
| GO  | state                     | 28/10 Dia do Servidor Público             | Lei 20.756/2020, art. 269, II, "c" | ponto-facultativo          | Norm suppresses work in state organs; annual decrees treat it as ponto facultativo.                                         |
| GO  | municipal (Goiânia)       | 20/11 Consciência Negra                   | Lei 8.786/2009                     | no-official-source         | No official Goiânia text found; date is a national holiday from 2024.                                                       |
| MA  | state                     | 20/11 Consciência Negra (state)           | Lei 8.444/2006                     | no-official-source         | Number only on aggregators; date is a national holiday from 2024.                                                           |
| MA  | municipal (São Luís)      | enabling law for 08/09 and 08/12          | Decreto 62.168/2025 (calendar)     | date-unconfirmed           | Dates confirmed in official DOM; constitutive numbers not retrieved.                                                        |
| MG  | state                     | 15/09 Nossa Senhora da Piedade            | PL 1.401/2023                      | not-a-law                  | Still in committee as of 2025; never enacted.                                                                               |
| MG  | municipal (BH)            | 12/12 aniversário                         | —                                  | not-a-holiday              | PBH treats the date as a celebration; its own veto message lists only four feriados.                                        |
| MG  | municipal (BH)            | Carnaval                                  | —                                  | ponto-facultativo          | Vetoed as unconstitutional in 2026; "feriado do comércio" only affects shop closing.                                        |
| MT  | municipal (Cuiabá)        | 20/11 Zumbi                               | Lei 3.991/2000                     | no-official-source         | Decrees cite it but its text was not retrieved; date is a national holiday from 2024.                                       |
| PA  | municipal (Belém)         | constitutive law for 12/01, 12/10, 08/12  | —                                  | date-unconfirmed           | Dates confirmed by official PGM/UFPA sources; annual Decreto 113.488/2025 is the citation shipped.                          |
| PA  | state                     | 19/11 Tratado de Petrópolis               | —                                  | wrong-jurisdiction         | That date belongs to Acre, not Pará.                                                                                        |
| PB  | state                     | 26/07                                     | Lei 3.489/1967, art. 2º            | possibly-revoked           | Lei 10.601/2015 partially revoked the older law; compiled text unavailable.                                                 |
| PR  | municipal (Curitiba)      | 29/03 aniversário                         | —                                  | not-a-holiday              | Extensive official Prefeitura coverage describes a celebration, not a feriado.                                              |
| RJ  | municipal (Rio)           | 01/03 fundação                            | Lei Orgânica art. 27               | not-a-holiday              | The article says the anniversary "is celebrated" on 01/03; the feriado is 20/01.                                            |
| RN  | municipal (Natal)         | 21/11 Nossa Senhora da Apresentação       | —                                  | no-official-source         | Date appears in official DOM calendar; enabling law not located.                                                            |
| RS  | municipal (Porto Alegre)  | 26/03 aniversário                         | —                                  | not-a-holiday              | Prefeitura explicitly states the city anniversary is not a feriado.                                                         |
| SC  | municipal (Florianópolis) | 20/11 Consciência Negra                   | Lei 8.046/2009                     | vigency-suspended          | Judicial decision suspended the municipal rule; the national holiday stands independently.                                  |
| SE  | state                     | 07/08                                     | Lei 8.441/2018                     | no-official-source         | Not found on al.se.leg.br; the verified basis is the state constitution, art. 269.                                          |
| SE  | municipal (Aracaju)       | 24/06 São João                            | Lei 3.805/2009                     | no-official-source         | Full text only on non-official repositories.                                                                                |
| SE  | municipal (Aracaju)       | Corpus Christi                            | Lei 1.358/1988 (Lei 3.805/2009)    | conflicting-classification | Some official calendars treat it as ponto facultativo.                                                                      |
| SP  | municipal (São Paulo)     | 25/01 observance                          | Lei 9.847/1985                     | observance-nuance          | The older law moves the _comemoração_ to the 4th Monday of January; the official 2026 calendar keeps the feriado on 25/01.  |
| TO  | state                     | 2026 transfer of 10/05 to 10/09           | Decreto 7.238/2026                 | one-off                    | Exceptional transfer grounded on Lei 1.088/1999, not a change to the canonical date.                                        |
| AC  | municipal (Rio Branco)    | 28/12 aniversário                         | Leis 1.557/2005, 1.609/2006        | no-official-source         | Only a LAI page and annual decrees found; no official law text.                                                             |
| AP  | municipal (Macapá)        | 08/12 Conceição                           | Lei 128/1980                       | no-official-source         | Only a city news item about a one-off holiday closure.                                                                      |
| MS  | municipal (Campo Grande)  | 13/06 Santo Antônio                       | Lei 3.901/2001                     | no-official-source         | Only union/news pages found citing the number; no official text.                                                            |
| PA  | municipal (Belém)         | 12/01 aniversário, 12/10 Pós-Círio, 08/12 | Decreto 113.488/2025               | calendar-only-decree       | No constitutive municipal law located; the annual decree only publishes dates (12/01 is ponto facultativo in some sources). |
| GO  | municipal (Goiânia)       | 24/05 Nossa Senhora Auxiliadora           | Lei 701/1956                       | no-official-source         | Referred to in an official DOM excerpt and an events page; base law text not published.                                     |
| RR  | municipal (Boa Vista)     | 20/01 São Sebastião, 29/06 São Pedro      | Lei 104/1984                       | no-official-source         | Only prefeitura news items about service during the holidays.                                                               |
| RR  | municipal (Boa Vista)     | 09/07 aniversário                         | Lei 1.705/2016                     | no-official-source         | Only a prefeitura news item found.                                                                                          |

## Verified absences and caveats (not omissions)

- **MG, PR** — no dedicated state feriado. Their "data magna" dates either duplicate a national
  holiday (MG 21/04) or are commemorative only.
- **DF** — not a municipality (CF art. 32). Its local holidays are district law under UF `DF`.
- **MA** — Corpus Christi is a state feriado by Lei 11.539/2021, upheld by TJMA, but annual
  executive decrees still label it ponto facultativo for state administration. The rule is shipped
  with a note recording the conflict.
- **RJ** — Carnaval Tuesday state holiday (Lei 5.243/2008) has a pending ADI 4131-2; Corpus Christi
  (Lei 11.002/2025) had ADI 7898 judged improcedente.
- **Curitiba** — municipal religious feriados exist under Lei 3.015/1967, but municipal bodies
  operate in ponto facultativo regime on those dates. They remain classified as feriados.
- **AC, GO, SC, TO, DF** — annual decrees may move the observance of a state feriado. The library
  stores the canonical legal date; year-specific transfers are out of scope for this milestone.

## Milestone 6 — verification of a challenged citation

The independent review asked to verify the RJ Corpus Christi state holiday. It **is** verifiable,
so the rule stays in [`src/holidays/state.ts`](../src/holidays/state.ts) and is **not** moved here:

- **Lei nº 11.002, de 22 de outubro de 2025** — official Alerj "Texto da Lei" page
  (http://alerjln1.alerj.rj.gov.br/contlei.nsf/c8aa0900025feef6032564ec0060dfff/46837e4d22b01f3503258d2c0048abda?OpenDocument),
  checked 2026-11-20. The page shows "Em Vigor com alterações", publication D.O nº 196, and the
  full text: "Fica instituído, no âmbito do Estado do Rio de Janeiro, o Dia de Corpus Christi como
  feriado estadual, a ser celebrado na primeira quinta-feira após decorridos sessenta dias do
  domingo de Páscoa."
- The same page records ADI 7898 (STF incidente 7434201) as "Declarada Constitucional", with the
  merits judgment "julgou improcedente o pedido" — matching the note in the rule.
- "Primeira quinta-feira após decorridos sessenta dias do domingo de Páscoa" is Easter Sunday + 60
  days (Thursday), the `offset: 60` stored in the rule. The `since: 2025` boundary matches the
  law's publication year (art. 2º: enters into force on publication).

A regression test in `tests/review-findings.test.ts` pins the citation and the 2025 boundary.
