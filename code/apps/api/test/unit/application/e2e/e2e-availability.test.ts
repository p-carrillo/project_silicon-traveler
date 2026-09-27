import { describe, expect, it } from 'vitest';
import { isE2EDevelopmentEnabled } from '../../../../src/application/e2e/e2e-availability';

describe('isE2EDevelopmentEnabled', () => {
  it('excludes production and test configurations', () => {
    expect(isE2EDevelopmentEnabled('development')).toBe(true);
    expect(isE2EDevelopmentEnabled('production')).toBe(false);
    expect(isE2EDevelopmentEnabled('test')).toBe(false);
  });
});
