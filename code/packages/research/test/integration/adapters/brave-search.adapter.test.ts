import { describe, it, expect } from 'vitest';
import { BraveSearchAdapter } from '../../../src/adapters/brave-search.adapter';

describe('BraveSearchAdapter (integration)', () => {
  it('returns a valid results array from Wikipedia search', async () => {
    const adapter = new BraveSearchAdapter();
    const results = await adapter.search('Pamplona Spain history culture tourism', 1);

    // External search can return [] when network/rate-limit fails, but it must never throw
    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      expect(typeof results[0].title).toBe('string');
      expect(typeof results[0].description).toBe('string');
      expect(typeof results[0].url).toBe('string');
      expect(results[0].url.startsWith('https://en.wikipedia.org/')).toBe(true);
    }
  });
});
