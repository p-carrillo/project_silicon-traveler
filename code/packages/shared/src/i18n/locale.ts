const normalizeLanguage = (value: string): string => value.trim().toLowerCase();

const getBaseLanguage = (language: string): string => language.split('-')[0];

export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];

  const parsed = header
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [langPart, ...params] = part.split(';').map((param) => param.trim());
      let quality = 1;

      for (const param of params) {
        if (!param.startsWith('q=')) continue;
        const value = Number(param.slice(2));
        if (Number.isFinite(value)) {
          quality = value;
        }
      }

      return {
        language: normalizeLanguage(langPart),
        quality,
      };
    })
    .filter((entry) => entry.language.length > 0)
    .sort((a, b) => b.quality - a.quality)
    .map((entry) => entry.language);

  return parsed;
}

export function resolveLanguage(
  preferred: string | string[] | null | undefined,
  supported: string[],
  fallback: string
): string {
  const supportedNormalized = supported.map(normalizeLanguage);
  const fallbackNormalized = normalizeLanguage(fallback);

  const candidates = Array.isArray(preferred)
    ? preferred
    : preferred
      ? [preferred]
      : [];

  for (const candidate of candidates) {
    const normalized = normalizeLanguage(candidate);
    const directIndex = supportedNormalized.indexOf(normalized);
    if (directIndex >= 0) {
      return supportedNormalized[directIndex];
    }

    const base = getBaseLanguage(normalized);
    const baseIndex = supportedNormalized.indexOf(base);
    if (baseIndex >= 0) {
      return supportedNormalized[baseIndex];
    }
  }

  if (supportedNormalized.includes(fallbackNormalized)) {
    return fallbackNormalized;
  }

  return supportedNormalized[0] || fallbackNormalized;
}
