import { headers } from 'next/headers';
import { getI18nConfig } from '@silicon-traveler/shared/dist/i18n/config';
import { parseAcceptLanguage, resolveLanguage } from '@silicon-traveler/shared/dist/i18n/locale';

export function getServerLocale(): string {
  const header = headers().get('accept-language');
  const { supportedLanguages, defaultLanguage } = getI18nConfig();
  const preferred = parseAcceptLanguage(header);
  return resolveLanguage(preferred, supportedLanguages, defaultLanguage);
}
