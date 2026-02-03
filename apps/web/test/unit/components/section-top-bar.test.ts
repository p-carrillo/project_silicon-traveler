import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../../..');

const readRepoFile = (...parts: string[]) =>
  readFileSync(path.join(repoRoot, ...parts), 'utf8');

describe('shared top bar usage', () => {
  it('renders the shared top bar and container on the journal page', () => {
    const page = readRepoFile('apps', 'web', 'src', 'app', 'page.tsx');

    expect(page).toContain('SectionTopBar');
    expect(page).toContain('PageContainer');
  });

  it('renders the shared top bar and container on the archive page', () => {
    const page = readRepoFile('apps', 'web', 'src', 'app', 'archive', 'page.tsx');

    expect(page).toContain('SectionTopBar');
    expect(page).toContain('PageContainer');
  });

  it('renders the shared top bar and container on the map page', () => {
    const page = readRepoFile('apps', 'web', 'src', 'app', 'map', 'page.tsx');

    expect(page).toContain('SectionTopBar');
    expect(page).toContain('PageContainer');
  });
});
