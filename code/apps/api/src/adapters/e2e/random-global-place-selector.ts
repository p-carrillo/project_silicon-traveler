import { randomInt } from 'node:crypto';
import type {
  GlobalPlaceCandidate,
  IGlobalPlaceSelector,
} from '../../application/e2e/global-place-selector.port';
import { GLOBAL_PLACE_CATALOG } from './global-place-catalog';

type RandomInteger = (maxExclusive: number) => number;

export class RandomGlobalPlaceSelector implements IGlobalPlaceSelector {
  constructor(
    private readonly catalog: readonly GlobalPlaceCandidate[] = GLOBAL_PLACE_CATALOG,
    private readonly nextRandomInteger: RandomInteger = (maxExclusive) => randomInt(maxExclusive)
  ) {}

  select(count: number): GlobalPlaceCandidate[] {
    if (!Number.isInteger(count) || count < 1 || count > this.catalog.length) {
      throw new Error(`Place selection count must be between 1 and ${this.catalog.length}`);
    }

    const countries = new Set<string>();
    const selected: GlobalPlaceCandidate[] = [];
    const byContinent = new Map<string, GlobalPlaceCandidate[]>();
    for (const place of this.catalog) {
      const places = byContinent.get(place.continent) ?? [];
      places.push(place);
      byContinent.set(place.continent, places);
    }

    for (const continent of shuffle([...byContinent.keys()], this.nextRandomInteger)) {
      if (selected.length === count) break;
      const place = selectUnrepresentedCountry(byContinent.get(continent) ?? [], countries, this.nextRandomInteger);
      if (!place) continue;
      selected.push(place);
      countries.add(place.country);
    }

    for (const place of shuffle(this.catalog, this.nextRandomInteger)) {
      if (selected.length === count) break;
      if (countries.has(place.country)) continue;
      selected.push(place);
      countries.add(place.country);
    }

    if (selected.length !== count) {
      throw new Error(`Place catalog cannot provide ${count} distinct countries`);
    }
    return selected;
  }
}

function selectUnrepresentedCountry(
  places: readonly GlobalPlaceCandidate[],
  countries: ReadonlySet<string>,
  nextRandomInteger: RandomInteger
): GlobalPlaceCandidate | null {
  const candidates = places.filter((place) => !countries.has(place.country));
  return candidates.length === 0 ? null : candidates[nextRandomInteger(candidates.length)];
}

function shuffle<T>(values: readonly T[], nextRandomInteger: RandomInteger): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = nextRandomInteger(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}
