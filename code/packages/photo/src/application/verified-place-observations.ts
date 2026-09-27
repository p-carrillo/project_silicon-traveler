const SETTLEMENT_TYPES = new Set(['city', 'town', 'village']);

export function getVerifiedPlaceObservations(osmData: unknown, placeName: string | null): string[] {
  const tags = readRecord(osmData);
  if (!tags) return [];

  const osmName = readString(tags.name);
  const settlementType = readString(tags.place)?.toLowerCase();
  if (!osmName || !placeName || normalize(osmName) !== normalize(placeName) || !settlementType || !SETTLEMENT_TYPES.has(settlementType)) {
    return [];
  }

  const observations = [`OpenStreetMap maps ${osmName} as a ${settlementType}.`];
  const population = readPositiveInteger(tags.population);
  if (population !== null) {
    observations.push(`OpenStreetMap lists a population of ${population} for ${osmName}.`);
  }
  return observations;
}

function readRecord(value: unknown): Record<string, unknown> | null {
  let parsed = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return null;
    }
  }
  return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
    ? parsed as Record<string, unknown>
    : null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readPositiveInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  if (typeof value !== 'string' || !/^\d+$/u.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').trim().toLowerCase();
}
