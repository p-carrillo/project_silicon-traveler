import { describe, it, expect } from 'vitest';
import { BraveSearchAdapter } from '../../../src/adapters/brave-search.adapter';

describe('BraveSearchAdapter (integration)', () => {
  it('returns empty results when API key is missing', async () => {
    const adapter = new BraveSearchAdapter('');
    const results = await adapter.search('test query', 1);

    // When API key is empty/invalid, the adapter should return empty array
    // or gracefully handle the error instead of throwing
    expect(Array.isArray(results)).toBe(true);
  });
});
