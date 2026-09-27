const getFallbackCopy = (language: string): { title: string; location: string } => {
  const normalized = language.trim().toLowerCase();
  if (normalized.startsWith('es')) {
    return {
      title: 'Lugar desconocido',
      location: 'Ubicación desconocida',
    };
  }

  return {
    title: 'Unknown place',
    location: 'Unknown location',
  };
};

export const buildPhotoTitle = (placeName: string | null, language: string): string => {
  const normalized = placeName?.trim();
  if (normalized) {
    return normalized;
  }

  return getFallbackCopy(language).title;
};

export const buildPhotoLocation = (
  placeName: string | null,
  region: string | null,
  country: string | null,
  language: string
): string => {
  const parts = [placeName, region, country]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter((part) => part.length > 0);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  return getFallbackCopy(language).location;
};
