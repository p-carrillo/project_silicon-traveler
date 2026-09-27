export type GlobalContinent =
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'Oceania'
  | 'South America';

export interface GlobalPlaceCandidate {
  placeName: string;
  country: string;
  region: string | null;
  continent: GlobalContinent;
}

export interface IGlobalPlaceSelector {
  select(count: number): GlobalPlaceCandidate[];
}
