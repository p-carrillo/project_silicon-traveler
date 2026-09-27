export const VISUAL_CATEGORIES = [
  'territory', 'built-environment', 'work-and-economy', 'movement', 'material-detail', 'human-presence',
] as const;
export type VisualCategory = (typeof VISUAL_CATEGORIES)[number];
export type VisualAnchorSource = 'research' | 'route';
export interface VisualBrief {
  category: VisualCategory;
  anchor: string;
  anchorSource: VisualAnchorSource;
  subject: string;
  setting: string;
  composition: string;
  timeAndWeather: string;
  visualConstraints: string[];
  negativeConstraints: string[];
  reflection?: string;
  originalPrompt?: string;
  revisedPrompt?: string | null;
}
export interface BuildVisualBriefInput {
  placeName: string;
  factualAnchor: string;
  visualMaterialAnchor: string;
  researchSupported: boolean;
  sequence: number;
}
const CATEGORY_EVIDENCE: Record<VisualCategory, readonly string[]> = {
  territory: ['river', 'mountain', 'coast', 'coastal', 'plain', 'forest', 'lake', 'valley', 'island', 'weather', 'río', 'montaña', 'costa', 'llanura', 'bosque', 'lago', 'valle', 'isla'],
  'built-environment': ['building', 'facade', 'architecture', 'bridge', 'station', 'church', 'cathedral', 'industrial', 'settlement', 'city', 'town', 'puente', 'estación', 'iglesia', 'catedral', 'edificio', 'arquitectura', 'asentamiento', 'ciudad', 'pueblo'],
  'work-and-economy': ['industry', 'agriculture', 'farming', 'market', 'workshop', 'factory', 'fishing', 'mining', 'economy', 'agricultura', 'mercado', 'taller', 'fábrica', 'pesca', 'minería', 'economía'],
  movement: ['road', 'route', 'railway', 'rail', 'transit', 'ferry', 'port', 'crossing', 'journey', 'carretera', 'ruta', 'ferrocarril', 'tren', 'tránsito', 'puerto', 'cruce', 'viaje'],
  'material-detail': ['stone', 'salt', 'pottery', 'textile', 'ceramic', 'food', 'cloth', 'wood', 'metal', 'piedra', 'sal', 'cerámica', 'textil', 'comida', 'madera', 'metal'],
  'human-presence': ['residents', 'workers', 'people', 'community', 'residentes', 'trabajadores', 'personas', 'comunidad'],
};
const CATEGORY_DIRECTION: Record<VisualCategory, { subject: string; setting: string; compositions: readonly string[] }> = {
  territory: { subject: 'the verified geographic feature named in the source anchor', setting: 'the landscape described by the source, without adding unverified landmarks', compositions: ['a broad environmental frame with the feature shaping the scene', 'a layered landscape frame that keeps the verified feature legible'] },
  'built-environment': { subject: 'the verified built feature named in the source anchor', setting: 'the documented settlement or structure in its ordinary surroundings', compositions: ['a street-level frame that shows the structure in its surroundings', 'a measured architectural frame using foreground and depth'] },
  'work-and-economy': { subject: 'the verified work or economic activity named in the source anchor', setting: 'the documented working environment, without inventing people or tools', compositions: ['an observational frame that shows the activity through its setting', 'a close environmental frame focused on evidence of the documented work'] },
  movement: { subject: 'the documented transport feature, or the traveller’s route through the place', setting: 'the verified route context, with no invented vehicle, station, or landmark', compositions: ['a forward-looking frame that follows the route through the scene', 'a side-on frame that makes the route and its surroundings readable'] },
  'material-detail': { subject: 'the verified material, object, or craft named in the source anchor', setting: 'the documented material context, without adding unverified cultural objects', compositions: ['a close detail with enough context to identify its setting', 'a tactile frame using texture and natural light'] },
  'human-presence': { subject: 'a local resident or community member explicitly supported by the source anchor, shown in their ordinary place context rather than as the travelling photographer', setting: 'the documented human setting, without assigning unsupported identity or status', compositions: ['a figure-in-environment frame that gives the place equal visual weight', 'an observational group frame grounded in the documented activity'] },
};
export function buildVisualBrief(input: BuildVisualBriefInput): VisualBrief {
  const anchor = input.researchSupported
    ? nonEmpty(input.visualMaterialAnchor, input.factualAnchor)
    : nonEmpty(input.visualMaterialAnchor, input.factualAnchor, 'The walking route passes through ' + input.placeName + '.');
  const normalizedAnchor = normalize(anchor);
  const grounded = VISUAL_CATEGORIES.filter((category) => CATEGORY_EVIDENCE[category].some((term) => containsTerm(normalizedAnchor, normalize(term))));
  const candidates: readonly VisualCategory[] = grounded.length ? grounded : ['movement'];
  const sequence = Number.isFinite(input.sequence) ? Math.max(0, Math.trunc(input.sequence)) : 0;
  const category = candidates[sequence % candidates.length];
  const direction = CATEGORY_DIRECTION[category];
  return {
    category,
    anchor,
    anchorSource: input.researchSupported ? 'research' : 'route',
    subject: direction.subject,
    setting: category === 'movement' && !grounded.includes('movement')
      ? 'the walking route through ' + input.placeName + ', without invented landmarks'
      : direction.setting,
    composition: direction.compositions[sequence % direction.compositions.length],
    timeAndWeather: 'Use natural available light. Do not invent a time of day or weather condition.',
    visualConstraints: [
      'Keep the source anchor visible through the subject or setting.',
      'Preserve a candid, present-day documentary point of view.',
      'Keep the location grounded in the stated source; do not add named landmarks or local customs.',
      ...(category === 'human-presence' ? ['Make a local inhabitant, not a visiting traveller, the human subject when people are supported by the anchor.'] : []),
    ],
    negativeConstraints: [
      'Avoid generic cultural shorthand, romanticised poverty, and staged tourist imagery.',
      'Do not add people, props, weather, signage, or architecture unsupported by the source anchor.',
      'Do not render readable text or the place name in the image.',
      ...(category === 'human-presence' ? ['Avoid a generic young backpacker, backpack, and visitor travel gear unless explicitly supported by the source anchor.'] : []),
    ],
  };
}
function containsTerm(text: string, term: string): boolean {
  const tokens = text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const termTokens = term.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return termTokens.length > 0 && tokens.some((_, start) => termTokens.every((token, offset) => tokens[start + offset] === token));
}
function nonEmpty(...values: string[]): string { return values.map((value) => value.trim()).find(Boolean) ?? ''; }
function normalize(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLowerCase(); }
