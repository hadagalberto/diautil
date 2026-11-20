import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

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

beforeAll(() => {
  if (!existsSync(cliPath)) {
    execFileSync('npm', ['run', 'build'], {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: process.platform === 'win32',
    });
  }
});

describe('CLI (built binary)', () => {
  it('prints its version and help', () => {
    expect(runCli(['--version']).stdout.trim()).toBe('0.1.0');
    expect(runCli(['--help']).stdout).toContain('diautil feriados <ano>');
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
});
