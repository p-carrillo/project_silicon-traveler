import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const journeyRoutesPath = path.resolve(testDir, '../../../src/routes/journey.routes.ts');
const journeyRoutesSource = readFileSync(journeyRoutesPath, 'utf8');

describe('journey.routes travel_mode exposure', () => {
  it('includes travel_mode in list query payload', () => {
    expect(journeyRoutesSource).toContain('travel_mode as travel_mode');
  });

  it('includes travel_mode in route-point detail payload', () => {
    expect(journeyRoutesSource).toContain('travel_mode: routePoint.travelMode');
  });
});
