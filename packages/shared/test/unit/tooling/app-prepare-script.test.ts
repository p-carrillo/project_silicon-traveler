import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('app prepare script', () => {
  it('installs dependencies non-interactively and marks readiness', () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, '../../../../..');
    const scriptPath = path.join(repoRoot, 'scripts', 'app-prepare.sh');
    const script = readFileSync(scriptPath, 'utf8');

    expect(script).toContain('pnpm install --frozen-lockfile --force');
    expect(script).toContain('for dir in /app/packages/* /app/apps/*');
    expect(script).toContain('touch "$READY_FILE"');
  });
});
