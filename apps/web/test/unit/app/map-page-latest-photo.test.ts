import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('map page latest photo wiring', () => {
  it('fetches latest photo and passes it to MapExplorer', () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, '../../../../..');
    const pagePath = path.join(repoRoot, 'apps', 'web', 'src', 'app', 'map', 'page.tsx');
    const page = readFileSync(pagePath, 'utf8');

    expect(page).toContain('import { getLatestPhoto } from \'@/lib/api\'');
    expect(page).toContain('const latestPhoto = await getLatestPhoto(locale)');
    expect(page).toContain('<MapExplorer locale={locale} latestPhoto={latestPhoto} />');
  });
});
