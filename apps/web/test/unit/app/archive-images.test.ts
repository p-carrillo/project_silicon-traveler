import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('Archive page', () => {
  it('uses images proxy for thumbnails', () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, '../../../../..');
    const pagePath = path.join(
      repoRoot,
      'apps',
      'web',
      'src',
      'app',
      'archive',
      'page.tsx'
    );

    const page = readFileSync(pagePath, 'utf8');

    expect(page).toContain("from '@/lib/images'");
    expect(page).toContain('src={toProxyImageSrc(photo.thumbnail_path)}');
  });
});
