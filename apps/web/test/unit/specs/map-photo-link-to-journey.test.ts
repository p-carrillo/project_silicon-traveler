import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../../..');

const readRepoFile = (...parts: string[]) =>
  readFileSync(path.join(repoRoot, ...parts), 'utf8');

describe('Spec: Map Photo Link to Journey', () => {
  const mapExplorer = readRepoFile(
    'apps', 'web', 'src', 'components', 'map', 'MapExplorer.tsx'
  );
  const activeFrame = readRepoFile(
    'apps', 'web', 'src', 'components', 'map', 'active-frame.ts'
  );

  it('MapExplorer imports Link from next/link', () => {
    expect(mapExplorer).toContain("from 'next/link'");
  });

  it('ActiveFrame type includes a dateSlug field', () => {
    expect(activeFrame).toContain('dateSlug');
  });

  it('the active frame image is wrapped in a Link to /photo/', () => {
    // The component should contain a Link with href using the dateSlug
    expect(mapExplorer).toContain('/photo/');
    expect(mapExplorer).toContain('activeFrame.dateSlug');
  });
});
