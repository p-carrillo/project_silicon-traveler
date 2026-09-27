import type { Request } from 'express';
import { getI18nConfig, parseAcceptLanguage, resolveLanguage } from '@silicon-traveler/shared';

export function resolveRequestLanguage(req: Request): string {
  const { supportedLanguages, defaultLanguage } = getI18nConfig();
  const rawQueryLang = req.query.lang;
  const queryLanguage = typeof rawQueryLang === 'string'
    ? rawQueryLang
    : Array.isArray(rawQueryLang) && typeof rawQueryLang[0] === 'string'
      ? rawQueryLang[0]
      : null;
  const rawHeader = req.headers['accept-language'];
  const header = Array.isArray(rawHeader) ? rawHeader.join(',') : rawHeader;
  const preferred = queryLanguage ? [queryLanguage] : parseAcceptLanguage(header);

  return resolveLanguage(preferred, supportedLanguages, defaultLanguage);
}
