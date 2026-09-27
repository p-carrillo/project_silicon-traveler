import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('photo date page', () => {
  it('fetches a photo by date range', () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, '../../../../..');
    const pagePath = path.join(
      repoRoot,
      'apps',
      'web',
      'src',
      'app',
      'photo',
      '[date]',
      'page.tsx'
    );
    const page = readFileSync(pagePath, 'utf8');

    expect(page).toContain('getPhotos(1');
    expect(page).toContain('startDate: dateSlug');
    expect(page).toContain('endDate: dateSlug');
  });
});
