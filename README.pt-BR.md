# diautil

Feriados e calendário de dias úteis do Brasil para TypeScript/JavaScript. Cada regra cita sua fonte
legal. Zero dependências em runtime, ESM + CJS, TypeScript estrito.

> Inclui o modelo de datas, Páscoa e datas móveis, o motor declarativo de regras, feriados
> nacionais, estaduais e municipais das 27 capitais, aritmética de dias úteis, calendários civil e
> bancário, auxiliares de liquidação e a CLI.

## Modelo de datas

Internamente o diautil usa datas civis simples, sem aritmética de `Date` dependente de fuso:

```ts
type PlainDate = { readonly year: number; readonly month: number; readonly day: number };
```

Intervalo suportado: anos **1900–2199** (gregoriano proléptico). Na fronteira da API, objetos
`Date` são interpretados em **America/Sao_Paulo** por padrão; aceitamos strings `YYYY-MM-DD`
estritas e também datas e horas ISO completas (`YYYY-MM-DDTHH:mm[:ss[.sss]][Z|±HH:mm]`). Todas as
APIs com opções expõem o campo `timeZone` (nome IANA), validado na fronteira. Um datetime com offset
explícito é convertido para esse fuso antes de se extrair a data; um datetime sem offset é lido como
hora local nesse fuso. `fromDate`/`toDate` recebem o mesmo fuso como segundo argumento. Dias da
semana são calculados aritmeticamente (0 = domingo).

```ts
import { fromISO, plainDate, toISO } from 'diautil';

fromISO('2024-03-31'); // Páscoa de 2024
toISO(plainDate(2024, 2, 29)); // '2024-02-29'
fromISO('2024-03-31T00:00:00Z', 'UTC'); // { year: 2024, month: 3, day: 31 }
fromISO('2024-03-31T00:00:00Z', 'America/Sao_Paulo'); // { year: 2024, month: 3, day: 30 }
```

## Feriados

```ts
import { holidays, isHoliday, holidayName, nextHoliday } from 'diautil';

holidays(2026).map((h) => toISO(h.date));
// ['2026-01-01', '2026-04-21', '2026-05-01', '2026-09-07',
//  '2026-10-12', '2026-11-02', '2026-11-15', '2026-11-20', '2026-12-25']

isHoliday('2023-11-20'); // false — não era feriado nacional em 2023
isHoliday('2024-11-20'); // true  — Lei 14.759/2023
holidayName('2024-11-20'); // 'Dia Nacional de Zumbi e da Consciência Negra'
nextHoliday('2024-11-20')?.date; // { year: 2024, month: 12, day: 25 }
```

Carnaval, Quarta-feira de Cinzas e Corpus Christi são **ponto facultativo**, não feriados
nacionais. Inclua explicitamente com `include: ['optional']`.

### Escopos estadual e municipal

O calendário é a união dos escopos selecionados. `uf` adiciona os feriados estaduais e `city` os
feriados municipais da capital; `include` filtra por tipo. Nomes de capitais são comparados sem
diferenciar maiúsculas e acentos. `uf` e `city` precisam ser compatíveis: cada capital pertence a
uma única UF, então `holidays(2026, { uf: 'RJ', city: 'São Paulo' })` lança `RangeError` em vez de
misturar feriados estaduais do RJ com feriados municipais de SP.

```ts
holidays(2026, { uf: 'SP' });
holidays(2026, { city: 'São Paulo' });
holidays(2026, { uf: 'RJ', city: 'Rio de Janeiro' });
isHoliday('2026-04-23', { uf: 'RJ' }); // Dia de São Jorge
```

Só entram regras verificadas em fonte oficial (assembleia/governo estadual ou prefeitura/câmara).
Leis que não puderam ser confirmadas não são incluídas: foram movidas para
[`docs/unverified.md`](docs/unverified.md).

### Feriados na mesma data

Quando uma lei estadual ou municipal repete um feriado nacional (Finados, 02/11, em Teresina), o
calendário devolve **uma única entrada**. A precedência é
`national > state > municipal > optional`; as demais citações legais ficam em `alsoDeclaredBy`.

```ts
const finados = holidays(2026, { city: 'Teresina' }).find(
  (h) => h.date.month === 11 && h.date.day === 2,
);
finados?.type; // 'national'
finados?.alsoDeclaredBy?.[0]?.law; // citação da lei municipal preservada
```

### Sexta-feira da Paixão (03/04/2026)

```ts
isHoliday('2026-04-03'); // false — sem cidade, não é lei nacional
isHoliday('2026-04-03', { city: 'São Paulo' }); // true  — feriado religioso municipal
isBusinessDay('2026-04-03'); // true  — sexta-feira civil
isBusinessDay('2026-04-03', { calendar: 'bancario' }); // false — sem liquidação interbancária

holidays(2026, { includeCustomaryNational: true }); // adiciona 2026-04-03
```

O art. 2º da Lei 9.093/1995 permite que municípios declarem a Sexta-feira da Paixão como feriado
religioso — ela **não** é feriado nacional. Por isso o calendário legal exige uma cidade. O sistema
financeiro (B3/ANBIMA/BCB/FEBRABAN) não opera nessa data em todo o país, então o calendário
bancário a marca incondicionalmente. A opção `includeCustomaryNational: true` acrescenta uma entrada
costumeira, explicitamente rotulada como não legal, para quem quer a lista "do dia a dia".

## Tabela de fontes

| Escopo                      | Feriado / regra                   | Fonte oficial                                                                                                                                                                                                               |
| --------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nacional                    | 01/01, 01/05, 07/09, 15/11, 25/12 | [Lei 662/1949](http://www.planalto.gov.br/ccivil_03/leis/l0662.htm)                                                                                                                                                         |
| Nacional                    | 21/04, 02/11                      | [Lei 10.607/2002](https://www.planalto.gov.br/ccivil_03/leis/2002/l10607.htm)                                                                                                                                               |
| Nacional                    | 12/10                             | [Lei 6.802/1980](http://www.planalto.gov.br/ccivil_03/leis/l6802.htm)                                                                                                                                                       |
| Nacional                    | 20/11 (desde 2024)                | [Lei 14.759/2023](https://planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14759.htm)                                                                                                                                      |
| Religioso (opção municipal) | Sexta-feira da Paixão             | [Lei 9.093/1995, art. 2º](https://www.planalto.gov.br/ccivil_03/leis/l9093.htm)                                                                                                                                             |
| Bancário                    | feriados nacionais sem expediente | [Resolução CMN 4.880/2020 via FEBRABAN](https://feriadosbancarios.febraban.org.br)                                                                                                                                          |
| Bancário                    | Carnaval e Sexta-feira Santa      | [FEBRABAN 2026](https://portal.febraban.org.br/noticia/4413/pt-br/) · [calendário B3](https://www.b3.com.br/pt_br/solucoes/plataformas/puma-trading-system/para-participantes-e-traders/calendario-de-negociacao/feriados/) |
| Bancário                    | feriados bancários                | [ANBIMA](https://www.anbima.com.br/feriados/feriados.asp)                                                                                                                                                                   |
| Boleto                      | vencimento em dia não útil        | [Lei 7.089/1983, art. 1º](http://www.planalto.gov.br/ccivil_03/leis/l7089.htm)                                                                                                                                              |
| Estadual (SP)               | 09/07                             | [Lei 9.497/1997 (Alesp)](https://www.al.sp.gov.br/legislacao/norma/9458)                                                                                                                                                    |
| Municipal (São Paulo)       | 25/01, 04/03, 06/04, 20/11        | [Lei 14.485/2007 (Câmara Municipal)](https://plpconsulta.saopaulo.sp.leg.br/Forms/MostrarArquivo?ANO=2007&DOCUMENTO=Atualizado&NUMERO=14485&TIPO=Lei)                                                                       |
| Municipal (Teresina)        | 04/03, 06/04, 02/11, 08/12, 16/08 | [Leis Básicas do Município (TRF1)](https://www.trf1.jus.br/sjpi/conteudo/files/leisbasicasTeresina.pdf)                                                                                                                     |

A tabela completa de citações está nos metadados de cada regra e nos comentários do código.
Páginas de notícias, decretos pontuais que apenas anteciparam uma data e leis com número divergente
foram rejeitados na auditoria de fontes.

## Dias úteis

```ts
import {
  addBusinessDays,
  businessDaysBetween,
  isBusinessDay,
  nthBusinessDayOfMonth,
  quintoDiaUtilSalario,
} from 'diautil';

isBusinessDay('2026-11-20'); // false — Zumbi, feriado nacional desde 2024
addBusinessDays('2026-11-19', 1); // 2026-11-23
addBusinessDays('2026-11-21', 0, { roll: 'backward' }); // 2026-11-19
// IMPORTANTE: businessDaysBetween conta o INTERVALO ABERTO (a, b) por padrão —
// nenhuma das duas datas entra na contagem. Isso difere de bibliotecas que
// incluem um ou ambos os extremos. Use { inclusive: true } para contar [a, b].
businessDaysBetween('2026-11-19', '2026-11-23'); // 0  — 20/11 feriado, 21–22 fim de semana
businessDaysBetween('2026-11-19', '2026-11-23', { inclusive: true }); // 2  — 19 e 23
businessDaysBetween('2026-11-19', '2026-11-19'); // 0
businessDaysBetween('2026-11-19', '2026-11-19', { inclusive: true }); // 1
businessDaysBetween('2026-11-19', '2026-11-25', { inclusive: true }); // 4
nthBusinessDayOfMonth(2026, 12, 5); // 2026-12-07 — 5º dia útil seg–sex
quintoDiaUtilSalario(2026, 12); // 2026-12-05 — prazo legal de pagamento (CLT art. 459, § 1º)
```

`nthBusinessDayOfMonth` usa o fim de semana do calendário (sábado e domingo por padrão). O prazo
legal do salário é diferente: conforme interpretação oficial do Ministério do Trabalho (Instrução
Normativa SRT nº 01, de 07/11/1989, item I — reafirmada pela IN/MTP nº 2/2021), o **sábado entra**
na contagem e apenas domingos e feriados (inclusive municipais) são excluídos. Por isso
`quintoDiaUtilSalario` ignora a opção `weekends` e fixa o fim de semana como somente domingo:
dezembro/2026 resulta em `2026-12-05` para o salário e `2026-12-07` para a contagem seg–sex. Fonte:
[gov.br/MTE IN nº 2/2021](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/areas-de-atuacao/documentos-pdf/in-2-de-8-denovembro-de-2021.pdf).

`createCalendar` devolve um calendário imutável e em cache. `extraHolidays` e `removeHolidays`
permitem personalizar o calendário. `boletoDueDateAdjust`, `settlementDate`, `settlementD1` e
`settlementD2` usam o calendário bancário por padrão. Detalhes em
[`docs/banking-calendar.md`](docs/banking-calendar.md).

## CLI `diautil`

```sh
diautil feriados 2026 --uf SP --cidade "São Paulo" --json
diautil util 2026-11-20 --uf RJ
diautil soma 2026-11-19 10 --calendario bancario
diautil entre 2026-01-01 2026-12-31 --uf MG
diautil quinto-dia-util 2026-12
diautil feriados 2026 --customarios --json
diautil --version
```

Saída em pt-BR por padrão; `--json` produz saída estável para máquinas. `entre` aceita
`--inclusive` e `--customarios` ativa a Sexta-feira da Paixão costumeira. `quinto-dia-util` mostra
as duas datas: a comum seg–sex (`diaUtilSegSex`) e a do salário com sábado computado
(`diaUtilSalario`).

## Desenvolvimento

```sh
npm ci
npm run check   # typecheck + lint + prettier + build + cobertura
```

Cobertura mínima: 95% de linhas. CI roda no Node 20, 22 e 24.

## Licença

MIT © Hadagalberto Junior. Veja [LICENSE](LICENSE).
