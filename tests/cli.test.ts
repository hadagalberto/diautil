import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = join(repoRoot, 'dist', 'cli.js');

interface CliResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}

function runCli(args: readonly string[]): CliResult {
  try {
    const stdout = execFileSync(process.execPath, [cliPath, ...args], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, stdout, stderr: '' };
  } catch (error: unknown) {
    const failure = error as { status?: number; stdout?: string; stderr?: string };
    return {
      status: failure.status ?? 1,
      stdout: failure.stdout ?? '',
      stderr: failure.stderr ?? '',
    };
  }
}

describe('CLI (built binary)', () => {
  it('prints its version and help', () => {
    expect(runCli(['--version']).stdout.trim()).toBe('0.1.0');
    const help = runCli(['--help']).stdout;
    expect(help).toContain('diautil feriados <ano>');
    expect(help).toContain('diautil util <data>');
    expect(help).toContain('diautil soma <data> <n>');
    expect(help).toContain('diautil entre <inicio> <fim>');
    expect(help).toContain('diautil quinto-dia-util <YYYY-MM>');
  });

  it('lists national holidays as pt-BR text', () => {
    const result = runCli(['feriados', '2026']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Feriados nacionais de 2026:');
    expect(result.stdout).toContain('2026-04-21  Dia de Tiradentes');
    expect(result.stdout).toContain('2026-11-20  Dia Nacional de Zumbi e da Consciência Negra');
  });

  it('emits machine-readable JSON including the 2024 law change', () => {
    const result = runCli(['feriados', '2024', '--json']);
    expect(result.status).toBe(0);
    interface ParsedEntry {
      readonly data: string;
      readonly nome: string;
      readonly tipo: string;
      readonly lei: string;
    }
    const parsed = JSON.parse(result.stdout) as ParsedEntry[];
    expect(parsed).toHaveLength(9);
    const zumbi = parsed.find((entry) => entry.data === '2024-11-20');
    expect(zumbi?.lei).toBe('Lei nº 14.759, de 21 de dezembro de 2023');
    expect(parsed[0]?.data).toBe('2024-01-01');
  });

  it('accepts --uf and --cidade scope flags', () => {
    interface ScopedEntry {
      readonly data: string;
      readonly nome: string;
      readonly tipo: string;
      readonly uf?: string;
      readonly cidade?: string;
      readonly fonte?: string;
    }
    const state = runCli(['feriados', '2026', '--uf', 'RJ', '--json']);
    expect(state.status).toBe(0);
    const stateEntries = JSON.parse(state.stdout) as ScopedEntry[];
    const saoJorge = stateEntries.find((entry) => entry.data === '2026-04-23');
    expect(saoJorge?.nome).toBe('Dia de São Jorge');
    expect(saoJorge?.tipo).toBe('state');
    expect(saoJorge?.uf).toBe('RJ');
    expect(saoJorge?.fonte).toMatch(/^https?:\/\//);

    const city = runCli(['feriados', '2026', '--cidade', 'sao paulo', '--json']);
    expect(city.status).toBe(0);
    const cityEntries = JSON.parse(city.stdout) as ScopedEntry[];
    const aniversario = cityEntries.find((entry) => entry.data === '2026-01-25');
    expect(aniversario?.nome).toBe('Aniversário da Cidade de São Paulo');
    expect(aniversario?.tipo).toBe('municipal');
    expect(aniversario?.cidade).toBe('São Paulo');

    const text = runCli(['feriados', '2026', '--uf', 'SP']);
    expect(text.stdout).toContain('Feriados de 2026 — SP:');
    expect(text.stdout).toContain('2026-07-09  Revolução Constitucionalista de 1932');
  });

  it('rejects unknown UF and city scopes', () => {
    expect(runCli(['feriados', '2026', '--uf', 'XX']).stderr).toContain('unknown UF');
    expect(runCli(['feriados', '2026', '--cidade', 'Nowhere']).stderr).toContain('unknown capital');
  });

  it('fails clearly on unknown commands and invalid years', () => {
    const unknown = runCli(['somar', '1', '2']);
    expect(unknown.status).toBe(1);
    expect(unknown.stderr).toContain('comando desconhecido');
    const badYear = runCli(['feriados', '2200']);
    expect(badYear.status).toBe(1);
    expect(badYear.stderr).toContain('ano inválido');
    const missingYear = runCli(['feriados']);
    expect(missingYear.status).toBe(1);
    expect(missingYear.stderr).toContain('informe o ano');
  });

  it('reports whether a date is a business day', () => {
    expect(runCli(['util', '2026-11-19']).stdout).toContain('2026-11-19 é dia útil.');
    expect(runCli(['util', '2026-11-20']).stdout).toContain('2026-11-20 não é dia útil.');
    const json = runCli(['util', '2026-11-20', '--json']);
    expect(json.status).toBe(0);
    interface UtilResult {
      readonly data: string;
      readonly util: boolean;
      readonly calendario: string;
    }
    expect(JSON.parse(json.stdout) as UtilResult).toEqual({
      data: '2026-11-20',
      util: false,
      calendario: 'civil',
    });
  });

  it('switches calendar with --calendario', () => {
    expect(runCli(['util', '2026-02-16', '--calendario', 'bancario']).stdout).toContain(
      'não é dia útil',
    );
    expect(runCli(['soma', '2026-02-13', '3']).stdout).toContain('= 2026-02-18');
    expect(runCli(['soma', '2026-02-13', '3', '--calendario', 'bancario']).stdout).toContain(
      '= 2026-02-20',
    );
  });

  it('adds business days with JSON output', () => {
    const result = runCli(['soma', '2026-11-19', '10', '--json']);
    expect(result.status).toBe(0);
    interface SomaResult {
      readonly data: string;
      readonly dias: number;
      readonly resultado: string;
      readonly calendario: string;
    }
    expect(JSON.parse(result.stdout) as SomaResult).toEqual({
      data: '2026-11-19',
      dias: 10,
      resultado: '2026-12-04',
      calendario: 'civil',
    });
  });

  it('counts business days between dates, with scope and inclusivity', () => {
    const result = runCli(['entre', '2026-01-01', '2026-12-31', '--uf', 'MG']);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('há 252 dias úteis.');
    interface EntreResult {
      readonly inicio: string;
      readonly fim: string;
      readonly diasUteis: number;
      readonly inclusive: boolean;
      readonly calendario: string;
    }
    const json = runCli([
      'entre',
      '2026-02-16',
      '2026-02-17',
      '--calendario',
      'bancario',
      '--inclusive',
      '--json',
    ]);
    expect(JSON.parse(json.stdout) as EntreResult).toEqual({
      inicio: '2026-02-16',
      fim: '2026-02-17',
      diasUteis: 0,
      inclusive: true,
      calendario: 'bancario',
    });
  });

  it('shows both the Mon–Fri and the legal salary fifth business day', () => {
    const text = runCli(['quinto-dia-util', '2026-12']);
    expect(text.status).toBe(0);
    expect(text.stdout).toContain('5º dia útil (seg–sex) de 2026-12: 2026-12-07');
    expect(text.stdout).toContain(
      '5º dia útil para salário (sábado incluso, CLT art. 459 § 1º) de 2026-12: 2026-12-05',
    );

    const json = runCli(['quinto-dia-util', '2026-12', '--json']);
    expect(json.status).toBe(0);
    interface QuintoResult {
      readonly mes: string;
      readonly diaUtil: number;
      readonly calendario: string;
      readonly diaUtilSegSex: string;
      readonly diaUtilSalario: string;
    }
    expect(JSON.parse(json.stdout) as QuintoResult).toEqual({
      mes: '2026-12',
      diaUtil: 5,
      calendario: 'civil',
      diaUtilSegSex: '2026-12-07',
      diaUtilSalario: '2026-12-05',
    });
  });

  it('applies holiday scope to both fifth-business-day values', () => {
    const json = runCli(['quinto-dia-util', '2026-12', '--json', '--cidade', 'sao paulo']);
    interface QuintoResult {
      readonly diaUtilSegSex: string;
      readonly diaUtilSalario: string;
    }
    // Both calendars still land on the same December dates for this scope.
    const parsed = JSON.parse(json.stdout) as QuintoResult;
    expect(parsed.diaUtilSegSex).toBe('2026-12-07');
    expect(parsed.diaUtilSalario).toBe('2026-12-05');
  });

  it('fails clearly on invalid business-day arguments', () => {
    expect(runCli(['util', '2026-13-01']).stderr).toContain('invalid date');
    expect(runCli(['util', '2026-11-19', '--calendario', 'x']).stderr).toContain(
      'calendário desconhecido',
    );
    expect(runCli(['util', '2026-11-19', '--uf', 'XX']).stderr).toContain('unknown UF');
    expect(runCli(['quinto-dia-util', '2026']).stderr).toContain('mês inválido');
    expect(runCli(['soma', '2026-11-19']).stderr).toContain('número de dias inválido');
    expect(runCli(['util', '2026-11-19', '--uf']).stderr).toContain('requer um valor');
  });

  it('keeps Good Friday out of the legal list and inside the banking calendar', () => {
    const legal = runCli(['feriados', '2026', '--json']);
    interface Entry {
      readonly data: string;
    }
    expect((JSON.parse(legal.stdout) as Entry[]).some((e) => e.data === '2026-04-03')).toBe(false);

    const customary = runCli(['feriados', '2026', '--customarios', '--json']);
    const customaryEntries = JSON.parse(customary.stdout) as Entry[];
    expect(customaryEntries.some((e) => e.data === '2026-04-03')).toBe(true);

    interface UtilResult {
      readonly util: boolean;
    }
    const banking = runCli(['util', '2026-04-03', '--calendario', 'bancario', '--json']);
    expect((JSON.parse(banking.stdout) as UtilResult).util).toBe(false);
    const civil = runCli(['util', '2026-04-03', '--json']);
    expect((JSON.parse(civil.stdout) as UtilResult).util).toBe(true);
  });
});
