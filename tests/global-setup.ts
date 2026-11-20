/**
 * Build the CLI once before the test suite runs.
 *
 * Uses the tsup API directly instead of deriving npm's location from
 * `process.execPath` — that path differs across Node installers (notably on
 * GitHub Actions ubuntu runners) and breaks the CLI tests on node 22.
 * `process.execPath` is still used by the tests to spawn `dist/cli.js`, which
 * is portable across ubuntu, windows and macos.
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'tsup';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function setup(): Promise<void> {
  await build({
    // Do not auto-load tsup.config.ts: its `clean: true` would wipe the rest
    // of dist, and its index entry is irrelevant to the CLI tests.
    config: false,
    clean: false,
    entry: { cli: resolve(repoRoot, 'src/cli.ts') },
    outDir: resolve(repoRoot, 'dist'),
    format: ['esm'],
    target: 'node20',
    sourcemap: true,
    banner: { js: '#!/usr/bin/env node' },
  });
}
