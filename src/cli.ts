/**
 * Minimal CLI scaffold: lists national holidays. Additional commands
 * (`util`, `soma`, `entre`, `quinto-dia-util`) are added in later milestones.
 */
import { holidays, toISO } from './index.js';

const VERSION = '0.1.0';

const HELP = `diautil ${VERSION} — feriados e calendário brasileiro

Uso:
  diautil feriados <ano> [--json]
  diautil --version

Opções:
  --json   saída legível por máquina
  -h, --help   mostra esta ajuda
`;

function fail(message: string): void {
  process.stderr.write(`diautil: ${message}\n${HELP}`);
  process.exitCode = 1;
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
  const yearArg = args.slice(1).find((arg) => !arg.startsWith('--'));
  if (yearArg === undefined) {
    fail('informe o ano: diautil feriados 2026');
    return;
  }
  const year = Number(yearArg);
  if (!Number.isInteger(year) || year < 1900 || year > 2199) {
    fail(`ano inválido: ${yearArg}`);
    return;
  }
  const found = holidays(year);
  if (args.includes('--json')) {
    process.stdout.write(
      `${JSON.stringify(
        found.map((holiday) => ({
          data: toISO(holiday.date),
          nome: holiday.namePt,
          tipo: holiday.type,
          lei: holiday.law,
        })),
        null,
        2,
      )}\n`,
    );
    return;
  }
  process.stdout.write(`Feriados nacionais de ${year}:\n`);
  for (const holiday of found) {
    process.stdout.write(`${toISO(holiday.date)}  ${holiday.namePt}\n`);
  }
}

run(process.argv.slice(2));
