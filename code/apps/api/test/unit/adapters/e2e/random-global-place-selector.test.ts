import { describe, expect, it } from 'vitest';
import { GLOBAL_PLACE_CATALOG } from '../../../../src/adapters/e2e/global-place-catalog';
import { RandomGlobalPlaceSelector } from '../../../../src/adapters/e2e/random-global-place-selector';

describe('RandomGlobalPlaceSelector', () => {
  it('selects ten places from distinct countries and covers every represented continent', () => {
    const selector = new RandomGlobalPlaceSelector(GLOBAL_PLACE_CATALOG, () => 0);

    const places = selector.select(10);

    expect(GLOBAL_PLACE_CATALOG).toHaveLength(300);
    expect(new Set(places.map((place) => place.country))).toHaveLength(10);
    expect(new Set(places.map((place) => place.continent))).toEqual(new Set([
      'Africa',
      'Asia',
      'Europe',
      'North America',
      'Oceania',
      'South America',
    ]));
  });

  it('rejects an invalid requested count', () => {
    const selector = new RandomGlobalPlaceSelector(GLOBAL_PLACE_CATALOG, () => 0);

    expect(() => selector.select(0)).toThrow('between 1 and 300');
  });
});
