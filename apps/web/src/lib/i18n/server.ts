import { headers } from 'next/headers';
import { getI18nConfig, parseAcceptLanguage, resolveLanguage } from '@silicon-traveler/shared';

export function getServerLocale(): string {
  const header = headers().get('accept-language');
  const { supportedLanguages, defaultLanguage } = getI18nConfig();
  const preferred = parseAcceptLanguage(header);
  return resolveLanguage(preferred, supportedLanguages, defaultLanguage);
}
