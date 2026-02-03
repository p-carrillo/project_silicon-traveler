import { describe, it, expect } from 'vitest';
import { parseBboxParam, parseLimitParam, parseZoomParam } from '../../../src/routes/map.utils';

describe('map.utils', () => {
  it('parses bbox param', () => {
    const result = parseBboxParam('-10,-5,10,5');
    expect(result.value).toEqual({
      minLng: -10,
      minLat: -5,
      maxLng: 10,
      maxLat: 5,
    });
  });

  it('rejects invalid bbox', () => {
    const result = parseBboxParam('10,5,-10,5');
    expect(result.error).toBeTruthy();
  });

  it('parses limit with fallback', () => {
    const result = parseLimitParam('25', 200);
    expect(result.value).toBe(25);
  });

  it('parses zoom', () => {
    const result = parseZoomParam('1.5');
    expect(result.value).toBe(1.5);
  });
});
