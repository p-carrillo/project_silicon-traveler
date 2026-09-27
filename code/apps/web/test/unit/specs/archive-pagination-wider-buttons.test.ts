import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../../..');

const readRepoFile = (...parts: string[]) =>
  readFileSync(path.join(repoRoot, ...parts), 'utf8');

describe('Spec: Archive Pagination Wider Buttons', () => {
  const archivePage = readRepoFile('apps', 'web', 'src', 'app', 'archive', 'page.tsx');

  it('prev/next buttons use w-20 width for wider text', () => {
    // Extract lines containing prev/next translation keys
    const lines = archivePage.split('\n');
    const prevNextLines = lines.filter(
      (line) => line.includes('t.archive.prev') || line.includes('t.archive.next')
    );

    // There should be 4 lines referencing prev/next (2 active links + 2 disabled divs)
    expect(prevNextLines.length).toBe(4);

    // Each prev/next button container should use w-20
    for (const line of prevNextLines) {
      // Find the enclosing element's className in nearby lines
      const lineIndex = lines.indexOf(line);
      const context = lines.slice(Math.max(0, lineIndex - 3), lineIndex + 1).join('\n');
      expect(context).toContain('w-20');
    }
  });

  it('page number buttons still use w-12 width', () => {
    // The first page button renders "01" and uses w-12
    expect(archivePage).toContain('w-12 h-12 flex items-center justify-center border border-black transition-colors font-black text-xs');
  });
});
