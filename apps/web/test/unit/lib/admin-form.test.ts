import { describe, expect, it } from 'vitest';
import { normalizeOptionalString, parseCoordinateInput, resolvePublishStatus } from '../../../src/lib/admin-form';

describe('admin-form utilities', () => {
  describe('normalizeOptionalString', () => {
    it('returns trimmed string when value has content', () => {
      const result = normalizeOptionalString('  Madrid  ');
      expect(result).toBe('Madrid');
    });

    it('returns null when value is empty after trimming', () => {
      const result = normalizeOptionalString('   ');
      expect(result).toBeNull();
    });

    it('returns null when value is not a string', () => {
      const result = normalizeOptionalString(null);
      expect(result).toBeNull();
    });
  });

  describe('parseCoordinateInput', () => {
    it('parses decimal with dot', () => {
      const result = parseCoordinateInput('43.3623');
      expect(result).toBeCloseTo(43.3623);
    });

    it('parses decimal with comma', () => {
      const result = parseCoordinateInput('43,3623');
      expect(result).toBeCloseTo(43.3623);
    });

    it('returns NaN for empty values', () => {
      expect(parseCoordinateInput('')).toBeNaN();
      expect(parseCoordinateInput('   ')).toBeNaN();
      expect(parseCoordinateInput(null)).toBeNaN();
    });
  });

  describe('resolvePublishStatus', () => {
    it('returns published when switch is enabled', () => {
      expect(resolvePublishStatus('pending', true)).toBe('published');
    });

    it('returns image_ready when switch is disabled from published', () => {
      expect(resolvePublishStatus('published', false)).toBe('image_ready');
    });

    it('keeps current status when switch is disabled from non-published', () => {
      expect(resolvePublishStatus('researched', false)).toBe('researched');
    });
  });
});
