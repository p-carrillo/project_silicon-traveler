import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('Footer version', () => {
  it('shows app version next to GitHub icon', () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, '../../../../..');
    const componentPath = path.join(
      repoRoot,
      'apps',
      'web',
      'src',
      'components',
      'layout',
      'Footer.tsx'
    );

    const component = readFileSync(componentPath, 'utf8');

    expect(component).toContain("const APP_VERSION = 'v.1.0.0'");
    expect(component).toContain('aria-label="GitHub"');
    expect(component).toContain('{APP_VERSION}');
  });
});
