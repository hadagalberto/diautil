/* global process */
/**
 * Regenerates tests/fixtures/national-2000-2035.json from the declarative
 * national rules. Run after `npm run build` and review the diff by hand:
 * every entry must be traceable to a law cited in src/holidays/national.ts.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import diautil from '../dist/index.cjs';

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, '../tests/fixtures/national-2000-2035.json');

const table = {};
for (let year = 2000; year <= 2035; year += 1) {
  table[year] = diautil.holidays(year).map((holiday) => ({
    data: diautil.toISO(holiday.date),
    nome: holiday.namePt,
    id: holiday.id,
  }));
}

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${JSON.stringify(table, null, 2)}\n`, 'utf8');
process.stdout.write(`wrote ${target}\n`);
