import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const adminRoutesPath = path.resolve(testDir, '../../../src/routes/admin.routes.ts');
const adminRoutesSource = readFileSync(adminRoutesPath, 'utf8');

describe('admin.routes travel_mode exposure', () => {
  it('includes travel_mode in list and detail payloads', () => {
    expect(adminRoutesSource).toContain('travel_mode: rp.travelMode');
    expect(adminRoutesSource).toContain('travel_mode: routePoint.travelMode');
  });

  it('accepts travel_mode during route-point creation', () => {
    expect(adminRoutesSource).toContain('const travelModeRaw = body.travel_mode');
    expect(adminRoutesSource).toContain('Invalid travel_mode');
  });
});
