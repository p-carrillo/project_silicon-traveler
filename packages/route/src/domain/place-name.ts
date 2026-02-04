export interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  municipality?: string;
  county?: string;
  state?: string;
  region?: string;
  country?: string;
}

export const derivePlaceName = (address: NominatimAddress | null | undefined): string => {
  if (!address) return 'Unknown';
  return (
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.municipality ||
    address.county ||
    address.state ||
    address.region ||
    address.country ||
    'Unknown'
  );
};
