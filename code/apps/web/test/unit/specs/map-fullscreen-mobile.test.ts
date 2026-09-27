import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../../..');

const readRepoFile = (...parts: string[]) =>
  readFileSync(path.join(repoRoot, ...parts), 'utf8');

describe('Spec: Map Fullscreen on Mobile', () => {
  const mapExplorer = readRepoFile(
    'apps', 'web', 'src', 'components', 'map', 'MapExplorer.tsx'
  );
  const mapPage = readRepoFile('apps', 'web', 'src', 'app', 'map', 'page.tsx');

  it('search input is hidden on mobile in the map header', () => {
    // The input element's container should have hidden md:flex or similar
    const lines = mapExplorer.split('\n');
    const inputIndex = lines.findIndex((line) => line.includes('filterPlaceholder'));
    expect(inputIndex).toBeGreaterThan(-1);

    // Look at nearby lines for the hidden class on the input container
    const context = lines.slice(Math.max(0, inputIndex - 5), inputIndex + 1).join('\n');
    expect(context).toContain('hidden md:flex');
  });

  it('map container has a generous height on mobile', () => {
    // The map aspect container should allow more height on mobile
    expect(mapExplorer).toContain('min-h-[60vh]');
  });

  it('map page has reduced padding on mobile', () => {
    expect(mapPage).toContain('py-2 md:py-10');
  });
});
