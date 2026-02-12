import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../../..');

describe('Spec: Admin login rate limit integration', () => {
  it('login page maps blocked attempts to too_many_attempts error', () => {
    const page = readFileSync(
      path.join(repoRoot, 'apps', 'web', 'src', 'app', 'admin', 'login', 'page.tsx'),
      'utf8'
    );

    expect(page).toContain("searchParams?.error === 'too_many_attempts'");
    expect(page).toContain("redirectToLoginWithError('too_many_attempts'");
    expect(page).toContain('registerFailedAdminLoginAttempt');
  });
});
