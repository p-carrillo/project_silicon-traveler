import { EDITORIAL_MODES, type EditorialGenerationConfig, type EditorialMode } from '../config/editorial';

export interface EditorialBrief {
  placeName: string;
  factualAnchor: string;
  requiredFactTokens: string[];
  visualMaterialAnchor: string;
  narrativeMode: EditorialMode;
  bannedRecentPhrases: string[];
  researchSupported: boolean;
}

export interface EditorialBriefInput {
  placeName: string;
  country: string;
  region: string;
  researchSummary: string;
  sequence: number;
  coordinates?: { lat: number; lng: number } | null;
  distanceFromPrevious?: number | null;
  recentNarratives: readonly string[];
  verifiedGeographicObservations?: readonly string[];
  config: EditorialGenerationConfig;
}

export interface EditorialQualityResult {
  accepted: boolean;
  reasons: string[];
}

const STOP_WORDS = new Set([
  'a', 'about', 'after', 'all', 'also', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'between', 'by',
  'city', 'during', 'for', 'from', 'has', 'have', 'in', 'into', 'is', 'it', 'its', 'located', 'near', 'of',
  'on', 'or', 'over', 'part', 'that', 'the', 'their', 'this', 'through', 'to', 'was', 'were', 'which', 'with', 'can', 'could', 'there', 'then', 'when', 'where', 'what', 'will', 'would', 'being', 'been',
  'aquí', 'al', 'como', 'con', 'de', 'del', 'desde', 'durante', 'el', 'en', 'entre', 'es', 'esta', 'este', 'para', 'pero', 'sobre', 'tambien', 'porque', 'han', 'fue', 'ser',
  'ha', 'la', 'las', 'los', 'más', 'por', 'que', 'se', 'su', 'sus', 'un', 'una', 'y', 'o', 'ubicado',
]);

const CLICHE_PHRASES = [
  'time stands still',
  'echoes of the past',
  'whispers of history',
  'the silence speaks',
  'where time seems to stop',
  'the wind carries memories',
  'el tiempo se detiene',
  'ecos del pasado',
  'susurros de la historia',
  'el silencio habla',
  'el viento trae recuerdos',
];

const ABSTRACT_CLICHE_WORDS = new Set([
  'silence', 'timelessness', 'timeless', 'vastness', 'memory', 'memories', 'whispers', 'echoes', 'endless',
  'stillness', 'silencio', 'eternidad', 'inmensidad', 'memoria', 'recuerdos', 'susurros', 'ecos', 'interminable',
]);

const CONCRETE_RESEARCH_TERMS = new Set([
  'bridge', 'canal', 'capital', 'cathedral', 'church', 'coast', 'crosses', 'founded', 'harbor', 'harbour',
  'historic', 'island', 'lake', 'market', 'mountain', 'museum', 'port', 'railway', 'river', 'road', 'station',
  'temple', 'tower', 'valley', 'wall', 'built', 'puente', 'canal', 'capital', 'catedral', 'iglesia', 'costa',
  'fundada', 'fundado', 'puerto', 'isla', 'lago', 'mercado', 'montana', 'museo', 'rio', 'carretera', 'estacion',
  'templo', 'torre', 'valle', 'muralla',
]);

export function buildEditorialBrief(input: EditorialBriefInput): EditorialBrief {
  const researchSentences = splitSentences(input.researchSummary);
  const placeTokens = new Set(meaningfulTokens(input.placeName));
  const researchAnchor = researchSentences.find((sentence) => {
    const tokens = meaningfulTokens(sentence);
    return tokens.length >= 4 && (
      tokens.some((token) => placeTokens.has(token)) ||
      tokens.some((token) => CONCRETE_RESEARCH_TERMS.has(token)) ||
      /\d/u.test(sentence)
    );
  });
  const researchSupported = Boolean(researchAnchor);
  const place = usableRouteFact(input.placeName);
  const regionAndCountry = [usableRouteFact(input.region), usableRouteFact(input.country)].filter(Boolean).join(', ');
  const routeLabel = [place, regionAndCountry].filter(Boolean).join(', ');
  const coordinateLabel = input.coordinates
    ? `${input.coordinates.lat.toFixed(3)}, ${input.coordinates.lng.toFixed(3)}`
    : '';
  const routeFact = [routeLabel, ...(input.verifiedGeographicObservations ?? []), coordinateLabel && `coordinates ${coordinateLabel}`]
    .filter(Boolean)
    .join('; ');

  const factualAnchor = researchAnchor ?? routeFact;
  const knownLocationTokens = new Set(meaningfulTokens([place, input.region, input.country].join(' ')));
  const requiredFactTokens = researchSupported
    ? unique(meaningfulTokens(factualAnchor).filter((token) => !knownLocationTokens.has(token))).slice(0, 1)
    : unique(meaningfulTokens(routeFact).filter((token) => !meaningfulTokens(place).includes(token) &&
        !['coordinates', 'previous', 'route', 'point', 'distance'].includes(token))).slice(0, 1);
  const settlementType = input.verifiedGeographicObservations?.join(' ').match(/as a (city|town|village)\b/iu)?.[1];
  if (!researchSupported && requiredFactTokens.length === 0 && settlementType) requiredFactTokens.push(settlementType.toLowerCase());
  const visualMaterialAnchor = researchSupported
    ? researchSentences.find((sentence) => sentence !== factualAnchor && meaningfulTokens(sentence).length >= 3) ?? factualAnchor
    : [...(input.verifiedGeographicObservations ?? []), coordinateLabel && `coordinates ${coordinateLabel}`, input.distanceFromPrevious && `${input.distanceFromPrevious} km from the previous route point`]
        .filter(Boolean)
        .join('; ') || routeLabel;

  return {
    placeName: place,
    factualAnchor,
    requiredFactTokens,
    visualMaterialAnchor,
    narrativeMode: researchSupported
      ? selectNarrativeMode(input.sequence, input.config.modeRecentWindow)
      : 'route-observation',
    bannedRecentPhrases: extractBannedPhrases(input.recentNarratives),
    researchSupported,
  };
}

export function selectNarrativeMode(sequence: number, recentWindow: number): EditorialMode {
  if (!EDITORIAL_MODES.length) return 'route-observation';
  const safeSequence = Number.isFinite(sequence) ? Math.max(0, Math.trunc(sequence)) : 0;
  const window = Math.min(Math.max(0, Math.trunc(recentWindow)), EDITORIAL_MODES.length - 1, safeSequence);
  const recentModes = new Set<EditorialMode>();

  for (let offset = 1; offset <= window; offset += 1) {
    recentModes.add(EDITORIAL_MODES[(safeSequence - offset) % EDITORIAL_MODES.length]);
  }

  for (let offset = 0; offset < EDITORIAL_MODES.length; offset += 1) {
    const candidate = EDITORIAL_MODES[(safeSequence + offset) % EDITORIAL_MODES.length];
    if (!recentModes.has(candidate)) return candidate;
  }

  return EDITORIAL_MODES[safeSequence % EDITORIAL_MODES.length];
}

export function evaluateEditorialNarrative(
  narrative: string,
  brief: EditorialBrief,
  recentNarratives: readonly string[]
): EditorialQualityResult {
  const reasons: string[] = [];
  const normalizedNarrative = normalize(narrative);
  const placeTokens = meaningfulTokens(brief.placeName);
  const requiredPlaceMatches = Math.min(1, placeTokens.length);
  const placeMatches = placeTokens.filter((token) => normalizedNarrative.includes(token)).length;
  const factualTermsPresent = brief.requiredFactTokens.length > 0 &&
    brief.requiredFactTokens.every((token) => normalizedNarrative.includes(normalize(token)));
  const hasFactualAnchor = placeTokens.length > 0 && placeMatches >= requiredPlaceMatches && factualTermsPresent;

  if (!hasFactualAnchor) {
    reasons.push(`The narrative must name ${brief.placeName} and include a concrete fact from the anchor: ${brief.requiredFactTokens.join(', ') || brief.factualAnchor}`);
  }

  const clichéMatches = CLICHE_PHRASES.filter((phrase) => normalizedNarrative.includes(normalize(phrase))).length;
  const clichéWordCount = meaningfulTokens(narrative).filter((token) => ABSTRACT_CLICHE_WORDS.has(token)).length;
  const narrativeWordCount = Math.max(1, meaningfulTokens(narrative).length);
  if ((clichéMatches > 0 && (!hasFactualAnchor || clichéMatches > 1)) ||
      (clichéWordCount >= 3 && clichéWordCount / narrativeWordCount >= 0.1)) {
    reasons.push('The narrative relies too heavily on generic contemplative language.');
  }

  const repeatedEntry = recentNarratives.find((recent) => tokenOverlap(narrative, recent) >= 0.65);
  if (repeatedEntry) {
    reasons.push('The narrative has high wording overlap with a recent entry.');
  }

  return { accepted: reasons.length === 0, reasons };
}

function extractBannedPhrases(narratives: readonly string[]): string[] {
  const phrases: string[] = [];
  const seen = new Set<string>();
  for (const narrative of narratives) {
    const tokens = meaningfulTokens(narrative);
    for (let index = 0; index <= tokens.length - 3 && phrases.length < 12; index += 1) {
      const phrase = tokens.slice(index, index + 3).join(' ');
      if (!seen.has(phrase)) {
        seen.add(phrase);
        phrases.push(phrase);
      }
    }
    if (phrases.length >= 12) break;
  }
  return phrases;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function usableRouteFact(value: string): string {
  const normalized = value.trim();
  return /^(?:unknown\b|n\/a\b|not available\b)/iu.test(normalized) ? '' : normalized;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/u)
    .map((sentence) => sentence.replace(/\s+/gu, ' ').trim())
    .filter(Boolean);
}

function meaningfulTokens(text: string): string[] {
  return normalize(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 4 && !STOP_WORDS.has(token));
}

function tokenOverlap(left: string, right: string): number {
  const leftTokens = new Set(meaningfulTokens(left));
  const rightTokens = new Set(meaningfulTokens(right));
  if (leftTokens.size < 8 || rightTokens.size < 8) return 0;
  const shared = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return shared / (leftTokens.size + rightTokens.size - shared);
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLowerCase();
}
