export interface I18nConfig {
  supportedLanguages: string[];
  defaultLanguage: string;
  contentBaseLanguage: string;
}

const DEFAULT_SUPPORTED_LANGUAGES = ['es', 'en'];
const DEFAULT_LANGUAGE = 'es';
const DEFAULT_CONTENT_BASE_LANGUAGE = 'en';

const normalizeLanguage = (value: string): string => value.trim().toLowerCase();

const uniqueLanguages = (languages: string[]): string[] => {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const language of languages) {
    if (!language) continue;
    if (seen.has(language)) continue;
    seen.add(language);
    unique.push(language);
  }

  return unique;
};

const parseLanguages = (raw: string | undefined): string[] => {
  if (!raw) return [];

  return uniqueLanguages(
    raw
      .split(',')
      .map((value) => normalizeLanguage(value))
      .filter(Boolean)
  );
};

export function getI18nConfig(): I18nConfig {
  const supportedFromEnv = parseLanguages(process.env.I18N_LANGUAGES);
  const supportedLanguages = supportedFromEnv.length
    ? supportedFromEnv
    : [...DEFAULT_SUPPORTED_LANGUAGES];

  const defaultLanguage = normalizeLanguage(
    process.env.I18N_DEFAULT_LANGUAGE || DEFAULT_LANGUAGE
  );

  if (!supportedLanguages.includes(defaultLanguage)) {
    supportedLanguages.unshift(defaultLanguage);
  }

  const contentBaseLanguage = normalizeLanguage(
    process.env.I18N_CONTENT_BASE_LANGUAGE || DEFAULT_CONTENT_BASE_LANGUAGE
  );

  return {
    supportedLanguages: uniqueLanguages(supportedLanguages),
    defaultLanguage,
    contentBaseLanguage,
  };
}
