import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('archive page filters', () => {
  it('does not render layout toggle controls', () => {
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

    expect(page).not.toContain('Layout:');
  });

  it('uses english empty-search copy', () => {
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

    expect(page).toContain('No results. Refine your search.');
    expect(page).not.toContain('Sin resultados');
  });

  it('offers a clear search link copy in english', () => {
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

    expect(page).toContain('View all photos');
  });

  it('links archive photos by published date slug', () => {
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

    expect(page).toContain('formatPhotoDateSlug');
    expect(page).toContain('/photo/${dateSlug}');
  });
});
