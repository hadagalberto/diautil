# Contributing to diautil

Obrigado por contribuir. Este projeto trata feriados como dados jurídicos: cada regra precisa de
uma fonte oficial verificável. Não publicamos no npm.

## Setup

```sh
npm ci
npm run check   # typecheck + lint + prettier + build + coverage
```

Node 20 ou superior. Zero dependências em runtime; as dependências de desenvolvimento estão no
`package.json`.

## Antes de abrir um pull request

- `npm run check` deve passar sem avisos (ESLint usa `--max-warnings 0`).
- Cobertura: ≥95% de linhas, ≥95% de funções e statements, ≥90% de branches.
- Novos comportamentos precisam de testes com vetores válidos e inválidos conhecidos. Não enfraqueça
  nem remova testes para fazer a suíte passar — corrija a causa.
- A CLI é testada spawnando o binário construído (`dist/cli.js`); `npm test` constrói o projeto
  automaticamente.

## Política de fontes (obrigatória)

1. Toda regra em `src/holidays/state.ts` e `src/holidays/municipal.ts` deve citar o número da lei e
   uma URL **do próprio texto legal** ou de uma compilação oficial do órgão público (assembleia,
   prefeitura, diário oficial, Planalto).
2. **Não** use páginas de notícia, páginas de evento, agregadores privados, Wikipédia ou decretos
   pontuais que apenas anteciparam/transferiram uma data (por exemplo, leis COVID de 2020) como
   fonte da regra.
3. Se o texto base não puder ser verificado, **não inclua a regra**. Registre-a em
   `docs/unverified.md` com o número alegado, o motivo e o que foi verificado.
4. Regras nacionais usam Planalto. Feriados bancários usam FEBRABAN, B3, ANBIMA e BCB; feriados
   religiosos municipais usam Lei 9.093/1995 art. 2º.
5. Nunca invente um número de lei. Em caso de dúvida, a regra vai para `docs/unverified.md`.

## Convenções de código

- TypeScript estrito (`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`).
- Datas internas são `PlainDate`; nunca use aritmética de `Date` com fuso fora de
  `fromDate`/`toDate`.
- Datas móveis são regras declarativas (`fixed`, `easter`, `nthWeekday`, `movedToMonday`) com
  `since`/`until` quando a vigência é conhecida.
- Nomes de arquivos e imports usam extensão `.js` (ESM + CJS via tsup).
- Comentários de lei devem copiar o número e artigo do texto oficial.

## Deduplicação

Várias leis podem declarar a mesma data. O calendário mantém apenas a de maior precedência
(`national > state > municipal > optional`) e preserva as outras citações em
`Holiday.alsoDeclaredBy`. Ao adicionar uma regra que repete um feriado existente, escreva um teste
que verifique o campo `alsoDeclaredBy`.

## Commits

Mensagens no padrão [Conventional Commits](https://www.conventionalcommits.org/), em inglês:
`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`. Commits são locais: nunca execute
`git push`, `gh` ou `npm publish`.
