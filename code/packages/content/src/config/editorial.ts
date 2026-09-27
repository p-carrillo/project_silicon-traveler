export interface EditorialGenerationConfig {
  recentHistoryLimit: number;
  modeRecentWindow: number;
  maxRegenerations: 1;
}

export const DEFAULT_EDITORIAL_GENERATION_CONFIG: EditorialGenerationConfig = {
  recentHistoryLimit: 5,
  modeRecentWindow: 3,
  maxRegenerations: 1,
};

export function getEditorialGenerationConfig(
  environment: Record<string, string | undefined> = process.env
): EditorialGenerationConfig {
  const recentHistoryLimit = readInteger(
    environment.EDITORIAL_RECENT_HISTORY_LIMIT,
    DEFAULT_EDITORIAL_GENERATION_CONFIG.recentHistoryLimit,
    0,
    50
  );
  const modeRecentWindow = readInteger(
    environment.EDITORIAL_MODE_RECENT_WINDOW,
    DEFAULT_EDITORIAL_GENERATION_CONFIG.modeRecentWindow,
    0,
    EDITORIAL_MODES.length - 1
  );

  return {
    recentHistoryLimit,
    modeRecentWindow,
    maxRegenerations: 1,
  };
}

export const EDITORIAL_MODES = [
  'field-note',
  'local-history',
  'infrastructure',
  'terrain-weather',
  'work-economy',
  'movement',
  'material-detail',
  'contrast',
] as const;

export type EditorialMode = (typeof EDITORIAL_MODES)[number] | 'route-observation';

function readInteger(value: string | undefined, fallback: number, minimum: number, maximum: number): number {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) return fallback;
  return parsed;
}
