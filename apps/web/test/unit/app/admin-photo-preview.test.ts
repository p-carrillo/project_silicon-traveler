import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('Admin photo preview', () => {
  it('shows preview in admin list and fallback gradient placeholder', () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, '../../../../..');
    const pagePath = path.join(repoRoot, 'apps', 'web', 'src', 'app', 'admin', 'page.tsx');
    const page = readFileSync(pagePath, 'utf8');

    expect(page).toContain("from '@/lib/images'");
    expect(page).toContain('src={imagePreviewSrc}');
    expect(page).toContain('bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-300');
  });

  it('shows fallback gradient placeholder in route-point editor when no photo exists', () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, '../../../../..');
    const pagePath = path.join(
      repoRoot,
      'apps',
      'web',
      'src',
      'app',
      'admin',
      'route-points',
      '[id]',
      'page.tsx'
    );
    const page = readFileSync(pagePath, 'utf8');

    expect(page).toContain('bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-300');
    expect(page).toContain('aspect-square');
    expect(page).toContain('{t.admin.fallback.noPhoto}');
  });
});
