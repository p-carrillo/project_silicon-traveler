import { describe, expect, it } from 'vitest';
import { InMemoryEphemeralRoutePointState } from '../../../../src/application/e2e/ephemeral-route-point-state';

describe('InMemoryEphemeralRoutePointState', () => {
  it('creates a process-only state record from temporary place data', () => {
    const state = new InMemoryEphemeralRoutePointState().create({ placeName: 'Lugo', country: 'Spain', region: 'Galicia', osmData: null });
    expect(state.id).toEqual(expect.any(String));
    expect(state.placeName).toBe('Lugo');
  });
});
