import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../../..');

const readRepoFile = (...parts: string[]) =>
  readFileSync(path.join(repoRoot, ...parts), 'utf8');

describe('Spec: Archive Hide Filters on Mobile', () => {
  const archivePage = readRepoFile('apps', 'web', 'src', 'app', 'archive', 'page.tsx');

  it('DateRangeAction and Geography container is hidden on mobile', () => {
    // The wrapper div that contains <DateRangeAction (JSX usage) and the geography link
    // should use "hidden md:flex" to hide on mobile
    const lines = archivePage.split('\n');
    const dateRangeIndex = lines.findIndex((line) => line.includes('<DateRangeAction'));
    expect(dateRangeIndex).toBeGreaterThan(-1);

    // Look at the parent div (a few lines before the JSX DateRangeAction)
    const parentContext = lines.slice(Math.max(0, dateRangeIndex - 3), dateRangeIndex + 1).join('\n');
    expect(parentContext).toContain('hidden md:flex');
  });

  it('SearchBar remains visible (no hidden class on its container)', () => {
    const lines = archivePage.split('\n');
    const searchBarIndex = lines.findIndex((line) => line.includes('SearchBar'));
    expect(searchBarIndex).toBeGreaterThan(-1);

    // The SearchBar's container div should not have hidden class
    const parentContext = lines.slice(Math.max(0, searchBarIndex - 3), searchBarIndex + 1).join('\n');
    expect(parentContext).not.toContain('hidden');
  });
});
