import { describe, it, expect } from 'vitest';
import { parseAcceptLanguage, resolveLanguage } from '../../../src/i18n/locale';

describe('i18n locale utilities', () => {
  it('parses Accept-Language with quality weights', () => {
    const header = 'en-US,en;q=0.8,es;q=0.9';
    const result = parseAcceptLanguage(header);
    expect(result).toEqual(['en-us', 'es', 'en']);
  });

  it('resolves preferred language with base match', () => {
    const supported = ['es', 'en'];
    expect(resolveLanguage('es-ES', supported, 'es')).toBe('es');
  });

  it('falls back when no preferred language matches', () => {
    const supported = ['es', 'en'];
    expect(resolveLanguage('fr', supported, 'es')).toBe('es');
  });

  it('handles preferred language lists', () => {
    const supported = ['es', 'en'];
    expect(resolveLanguage(['fr', 'en-GB'], supported, 'es')).toBe('en');
  });
});
