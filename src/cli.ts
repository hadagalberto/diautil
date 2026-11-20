/**
 * CLI for holidays and business-day arithmetic.
 * All commands accept `--json` for machine-readable output.
 */
import {
  addBusinessDays,
  businessDaysBetween,
  fromISO,
  holidays,
  isBusinessDay,
  isUF,
  nthBusinessDayOfMonth,
  quintoDiaUtilSalario,
  toISO,
  toPlainDate,
  type CalendarKind,
  type CalendarOptions,
  type DateInput,
  type HolidayOptions,
  type UF,
} from './index.js';

const VERSION = '0.1.0';

const HELP = `diautil ${VERSION} — feriados e calendário brasileiro

Uso:
  diautil feriados <ano> [--uf UF] [--cidade NOME] [--customarios] [--json]
  diautil util <data> [--uf UF] [--cidade NOME] [--calendario civil|bancario] [--json]
  diautil soma <data> <n> [--calendario civil|bancario] [--json]
  diautil entre <inicio> <fim> [--uf UF] [--cidade NOME] [--inclusive] [--json]
  diautil quinto-dia-util <YYYY-MM> [--uf UF] [--cidade NOME] [--json]
  diautil --version

Opções:
  --uf UF          sigla da unidade federativa (ex.: SP, RJ, MG)
  --cidade NOME    capital cujos feriados municipais entram no calendário
  --calendario T   calendário: civil (padrão) ou bancario
  --inclusive      conta as duas datas em "entre"
  --customarios    inclui a Sexta-feira da Paixão como feriado nacional costumeiro
  --json           saída legível por máquina
  -h, --help       mostra esta ajuda
`;

const VALUE_FLAGS: ReadonlySet<string> = new Set(['--uf', '--cidade', '--calendario']);

interface ParsedArgs {
  readonly positionals: readonly string[];
  readonly flags: ReadonlyMap<string, string | true>;
}

interface CalendarFlags {
  readonly options: CalendarOptions;
  readonly calendar: CalendarKind;
}

function fail(message: string): void {
  process.stderr.write(`diautil: ${message}\n${HELP}`);
  process.exitCode = 1;
}

function parseArgs(args: readonly string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags = new Map<string, string | true>();
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? '';
    if (VALUE_FLAGS.has(arg)) {
      const value = args[index + 1];
      if (value === undefined || value.startsWith('--')) {
        throw new Error(`opção ${arg} requer um valor`);
      }
      flags.set(arg, value);
      index += 1;
    } else if (arg.startsWith('-')) {
      flags.set(arg, true);
    } else {
      positionals.push(arg);
    }
  }
  return { positionals, flags };
}

function readUf(flags: ReadonlyMap<string, string | true>): UF | undefined {
  const raw = flags.get('--uf');
  if (raw === undefined || typeof raw !== 'string') {
    return undefined;
  }
  const uf = raw.toUpperCase();
  if (!isUF(uf)) {
    throw new RangeError(`unknown UF: ${raw}`);
  }
  return uf;
}

function readCalendarKind(flags: ReadonlyMap<string, string | true>): CalendarKind {
  const raw = flags.get('--calendario');
  if (raw === undefined) {
    return 'civil';
  }
  if (raw === 'civil' || raw === 'bancario') {
    return raw;
  }
  throw new RangeError(`calendário desconhecido: ${String(raw)}`);
}

function readFlags(flags: ReadonlyMap<string, string | true>): CalendarFlags {
  const uf = readUf(flags);
  const city = flags.get('--cidade');
  const customary = flags.has('--customarios');
  return {
    calendar: readCalendarKind(flags),
    options: {
      ...(uf === undefined ? {} : { uf }),
      ...(city === undefined || typeof city !== 'string' ? {} : { city }),
      ...(customary ? { includeCustomaryNational: true } : {}),
    },
  };
}

function readDate(value: string | undefined, label: string): DateInput {
  if (value === undefined) {
    throw new RangeError(`informe ${label} no formato AAAA-MM-DD`);
  }
  return fromISO(value);
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function runFeriados(
  positionals: readonly string[],
  flags: ReadonlyMap<string, string | true>,
): void {
  const yearArg = positionals[0];
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
    const parsed = readFlags(flags);
    if (parsed.calendar !== 'civil') {
      throw new RangeError('--calendario não se aplica a feriados');
    }
    options = Object.keys(parsed.options).length === 0 ? undefined : parsed.options;
  } catch (error: unknown) {
    fail(error instanceof Error ? error.message : String(error));
    return;
  }
  const found = holidays(year, options);
  if (flags.has('--json')) {
    printJson(
      found.map((holiday) => ({
        data: toISO(holiday.date),
        nome: holiday.namePt,
        tipo: holiday.type,
        uf: holiday.uf,
        cidade: holiday.city,
        lei: holiday.law,
        fonte: holiday.source,
      })),
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

function runUtil(positionals: readonly string[], flags: ReadonlyMap<string, string | true>): void {
  let date: DateInput;
  let parsed: CalendarFlags;
  try {
    date = readDate(positionals[0], 'a data');
    parsed = readFlags(flags);
  } catch (error: unknown) {
    fail(error instanceof Error ? error.message : String(error));
    return;
  }
  const result = isBusinessDay(date, { ...parsed.options, calendar: parsed.calendar });
  if (flags.has('--json')) {
    printJson({ data: toISO(toPlainDate(date)), util: result, calendario: parsed.calendar });
    return;
  }
  process.stdout.write(
    `${toISO(toPlainDate(date))} ${result ? 'é dia útil' : 'não é dia útil'}.\n`,
  );
}

function runSoma(positionals: readonly string[], flags: ReadonlyMap<string, string | true>): void {
  let date: DateInput;
  let days: number;
  let parsed: CalendarFlags;
  try {
    date = readDate(positionals[0], 'a data');
    const raw = positionals[1];
    days = Number(raw);
    if (raw === undefined || !Number.isInteger(days)) {
      throw new RangeError(`número de dias inválido: ${String(raw)}`);
    }
    parsed = readFlags(flags);
  } catch (error: unknown) {
    fail(error instanceof Error ? error.message : String(error));
    return;
  }
  const result = addBusinessDays(date, days, { ...parsed.options, calendar: parsed.calendar });
  if (flags.has('--json')) {
    printJson({
      data: toISO(toPlainDate(date)),
      dias: days,
      resultado: toISO(result),
      calendario: parsed.calendar,
    });
    return;
  }
  process.stdout.write(
    `${toISO(toPlainDate(date))} + ${String(days)} dias úteis = ${toISO(result)}\n`,
  );
}

function runEntre(positionals: readonly string[], flags: ReadonlyMap<string, string | true>): void {
  let start: DateInput;
  let end: DateInput;
  let parsed: CalendarFlags;
  try {
    start = readDate(positionals[0], 'a data inicial');
    end = readDate(positionals[1], 'a data final');
    parsed = readFlags(flags);
  } catch (error: unknown) {
    fail(error instanceof Error ? error.message : String(error));
    return;
  }
  const inclusive = flags.has('--inclusive');
  const count = businessDaysBetween(start, end, {
    ...parsed.options,
    calendar: parsed.calendar,
    inclusive,
  });
  if (flags.has('--json')) {
    printJson({
      inicio: toISO(toPlainDate(start)),
      fim: toISO(toPlainDate(end)),
      diasUteis: count,
      inclusive,
      calendario: parsed.calendar,
    });
    return;
  }
  process.stdout.write(
    `Entre ${toISO(toPlainDate(start))} e ${toISO(toPlainDate(end))} há ${String(count)} dias úteis${inclusive ? ' (incluindo as datas)' : ''}.\n`,
  );
}

function runQuintoDiaUtil(
  positionals: readonly string[],
  flags: ReadonlyMap<string, string | true>,
): void {
  let year: number;
  let month: number;
  let parsed: CalendarFlags;
  try {
    const raw = positionals[0];
    const match = /^(\d{4})-(\d{2})$/.exec(raw ?? '');
    if (match?.[1] === undefined || match[2] === undefined) {
      throw new RangeError(`mês inválido: ${String(raw)} (use AAAA-MM)`);
    }
    year = Number(match[1]);
    month = Number(match[2]);
    parsed = readFlags(flags);
  } catch (error: unknown) {
    fail(error instanceof Error ? error.message : String(error));
    return;
  }
  const calendarOptions = { ...parsed.options, calendar: parsed.calendar };
  // Civil rule: Monday to Friday count (nthBusinessDayOfMonth keeps this meaning).
  const civil = nthBusinessDayOfMonth(year, month, 5, calendarOptions);
  // Legal salary deadline: Saturday counts (CLT art. 459, § 1º + IN SRT 01/1989).
  const salario = quintoDiaUtilSalario(year, month, calendarOptions);
  const label = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`;
  if (flags.has('--json')) {
    printJson({
      mes: label,
      diaUtil: 5,
      calendario: parsed.calendar,
      diaUtilSegSex: toISO(civil),
      diaUtilSalario: toISO(salario),
    });
    return;
  }
  process.stdout.write(`5º dia útil (seg–sex) de ${label}: ${toISO(civil)}\n`);
  process.stdout.write(
    `5º dia útil para salário (sábado incluso, CLT art. 459 § 1º) de ${label}: ${toISO(salario)}\n`,
  );
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
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(args.slice(1));
  } catch (error: unknown) {
    fail(error instanceof Error ? error.message : String(error));
    return;
  }
  try {
    switch (command) {
      case 'feriados':
        runFeriados(parsed.positionals, parsed.flags);
        return;
      case 'util':
        runUtil(parsed.positionals, parsed.flags);
        return;
      case 'soma':
        runSoma(parsed.positionals, parsed.flags);
        return;
      case 'entre':
        runEntre(parsed.positionals, parsed.flags);
        return;
      case 'quinto-dia-util':
        runQuintoDiaUtil(parsed.positionals, parsed.flags);
        return;
      default:
        fail(`comando desconhecido: ${command}`);
    }
  } catch (error: unknown) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

run(process.argv.slice(2));
