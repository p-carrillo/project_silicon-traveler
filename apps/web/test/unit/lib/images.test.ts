import { describe, expect, it } from 'vitest';

import { toProxyImageSrc } from '../../../src/lib/images';

describe('toProxyImageSrc', () => {
  it('keeps relative image paths', () => {
    expect(toProxyImageSrc('2026/02/08/1.jpg')).toBe('/api/images/2026/02/08/1.jpg');
  });

  it('removes a leading slash', () => {
    expect(toProxyImageSrc('/2026/02/08/1.jpg')).toBe('/api/images/2026/02/08/1.jpg');
  });

  it('removes a leading images prefix', () => {
    expect(toProxyImageSrc('images/2026/02/08/1.jpg')).toBe('/api/images/2026/02/08/1.jpg');
  });

  it('removes both leading slash and images prefix', () => {
    expect(toProxyImageSrc('/images/2026/02/08/1.jpg')).toBe('/api/images/2026/02/08/1.jpg');
  });
});
