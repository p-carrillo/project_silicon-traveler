import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('PhotoJournal', () => {
  it('uses images proxy and square layout', () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, '../../../../..');
    const componentPath = path.join(
      repoRoot,
      'apps',
      'web',
      'src',
      'components',
      'photo',
      'PhotoJournal.tsx'
    );

    const component = readFileSync(componentPath, 'utf8');

    expect(component).toContain('/api/images/');
    expect(component).toContain('aspect-square');
  });
});
