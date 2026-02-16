import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../../..');

const readRepoFile = (...parts: string[]) =>
  readFileSync(path.join(repoRoot, ...parts), 'utf8');

describe('Spec: Map Zoom Controls', () => {
  const mapExplorer = readRepoFile(
    'apps', 'web', 'src', 'components', 'map', 'MapExplorer.tsx'
  );

  it('supports a higher max map zoom', () => {
    expect(mapExplorer).toContain('const MAX_MAP_ZOOM = 24;');
  });

  it('enables double click zoom on the SVG map', () => {
    expect(mapExplorer).toContain('onDoubleClick={handleDoubleClick}');
  });

  it('zooms around cursor position for wheel and double click', () => {
    expect(mapExplorer).toContain('zoomViewportAtClientPoint');
    expect(mapExplorer).toContain('event.clientX');
    expect(mapExplorer).toContain('event.clientY');
  });

  it('scales pin visuals with zoom while keeping click hit area', () => {
    expect(mapExplorer).toContain('const zoomProgress = useMemo');
    expect(mapExplorer).toContain('const hitRadius = Math.max(4.6, coreRadius * 6.2);');
    expect(mapExplorer).toContain('pointerEvents="all"');
    expect(mapExplorer).toContain('fill="rgba(0,0,0,0.001)"');
  });

  it('keeps pins selectable via pointer events and keyboard', () => {
    expect(mapExplorer).toContain('const handlePinPointerUp = (pin: MapPin, event: PointerEvent<SVGGElement>) => {');
    expect(mapExplorer).toContain('onPointerUp={(event) => handlePinPointerUp(pin, event)}');
    expect(mapExplorer).toContain('role="button"');
    expect(mapExplorer).toContain('tabIndex={0}');
    expect(mapExplorer).toContain('onKeyDown={(event) => handlePinKeyDown(pin, event)}');
  });

  it('starts drag only from map background and safely releases pointer capture', () => {
    expect(mapExplorer).toContain('if (event.target !== event.currentTarget) {');
    expect(mapExplorer).toContain('if (svg?.hasPointerCapture(event.pointerId)) {');
    expect(mapExplorer).toContain('onPointerCancel={handlePointerUp}');
  });
});
