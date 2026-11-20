/**
 * CLI for listing holidays. Supports national, state and capital-city scopes
 * through `--uf` and `--cidade`. Other commands are added in later milestones.
 */
import { holidays, toISO, type HolidayOptions, type UF } from './index.js';

const VERSION = '0.1.0';

const HELP = `diautil ${VERSION} — feriados e calendário brasileiro

Uso:
  diautil feriados <ano> [--uf UF] [--cidade NOME] [--json]
  diautil --version

Opções:
  --uf UF        sigla da unidade federativa (ex.: SP, RJ, MG)
  --cidade NOME  capital cujos feriados municipais entram no calendário
  --json         saída legível por máquina
  -h, --help     mostra esta ajuda
`;

function fail(message: string): void {
  process.stderr.write(`diautil: ${message}\n${HELP}`);
  process.exitCode = 1;
}

function optionValue(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
}

function readOptions(args: readonly string[]): HolidayOptions | undefined {
  const uf = optionValue(args, '--uf');
  const city = optionValue(args, '--cidade');
  const options: { uf?: UF; city?: string } = {};
  if (uf !== undefined) {
    options.uf = uf.toUpperCase() as UF;
  }
  if (city !== undefined) {
    options.city = city;
  }
  if (uf === undefined && city === undefined) {
    return undefined;
  }
  return options;
}

function run(args: readonly string[]): void {
  const command = args[0];
  if (command === undefined || command === '--help' || command === '-h') {
    process.stdout.write(HELP);
    return;
  }
  if (command === '--version' || command === '-v') {
    process.stdout.write(`${VERSION}\n`);
    return;
  }
  if (command !== 'feriados') {
    fail(`comando desconhecido: ${command}`);
    return;
  }
  const positional = args.slice(1).filter((arg, index, all) => {
    if (arg.startsWith('--')) {
      return false;
    }
    const previous = all[index - 1];
    return previous !== '--uf' && previous !== '--cidade';
  });
  const yearArg = positional[0];
  if (yearArg === undefined) {
    fail('informe o ano: diautil feriados 2026');
    return;
  }
  const year = Number(yearArg);
  if (!Number.isInteger(year) || year < 1900 || year > 2199) {
    fail(`ano inválido: ${yearArg}`);
    return;
  }
  let options: HolidayOptions | undefined;
  try {
    options = readOptions(args);
  } catch (error: unknown) {
    fail(error instanceof Error ? error.message : String(error));
    return;
  }
  let found;
  try {
    found = holidays(year, options);
  } catch (error: unknown) {
    fail(error instanceof Error ? error.message : String(error));
    return;
  }
  if (args.includes('--json')) {
    process.stdout.write(
      `${JSON.stringify(
        found.map((holiday) => ({
          data: toISO(holiday.date),
          nome: holiday.namePt,
          tipo: holiday.type,
          uf: holiday.uf,
          cidade: holiday.city,
          lei: holiday.law,
          fonte: holiday.source,
        })),
        null,
        2,
      )}\n`,
    );
    return;
  }
  const scope = [options?.uf, options?.city].filter(Boolean).join(' / ');
  const header =
    scope === '' ? `Feriados nacionais de ${year}:` : `Feriados de ${year} — ${scope}:`;
  process.stdout.write(`${header}\n`);
  for (const holiday of found) {
    process.stdout.write(`${toISO(holiday.date)}  ${holiday.namePt}\n`);
  }
}

run(process.argv.slice(2));
