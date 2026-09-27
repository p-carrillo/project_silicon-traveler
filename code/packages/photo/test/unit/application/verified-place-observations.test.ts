import { describe, expect, it } from 'vitest';
import { getVerifiedPlaceObservations } from '../../../src/application/verified-place-observations';

describe('getVerifiedPlaceObservations', () => {
  it('uses only matching OSM settlement fields with allowlisted values', () => {
    expect(getVerifiedPlaceObservations(
      { name: 'A Coruña', place: 'city', population: '245000', cuisine: 'seafood' },
      'A Coruna'
    )).toEqual([
      'OpenStreetMap maps A Coruña as a city.',
      'OpenStreetMap lists a population of 245000 for A Coruña.',
    ]);
  });

  it('ignores unknown, mismatched, and non-settlement data', () => {
    expect(getVerifiedPlaceObservations({ name: 'Unknown', place: 'unknown' }, 'Unknown')).toEqual([]);
    expect(getVerifiedPlaceObservations({ name: 'Another place', place: 'town' }, 'Pamplona')).toEqual([]);
    expect(getVerifiedPlaceObservations('{bad json', 'Pamplona')).toEqual([]);
  });
});
