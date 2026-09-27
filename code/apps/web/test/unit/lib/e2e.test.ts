import { describe, expect, it } from 'vitest';
import { isE2EDevelopmentEnabled } from '../../../src/lib/e2e';

describe('isE2EDevelopmentEnabled', () => {
  it('enables E2E only in development', () => {
    expect(isE2EDevelopmentEnabled('development')).toBe(true);
    expect(isE2EDevelopmentEnabled('production')).toBe(false);
    expect(isE2EDevelopmentEnabled('test')).toBe(false);
  });
});
