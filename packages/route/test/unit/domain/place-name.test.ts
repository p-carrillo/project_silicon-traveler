import { describe, it, expect } from 'vitest';
import { derivePlaceName } from '../../../src/domain/place-name';

describe('derivePlaceName', () => {
  it('prefers city fields in priority order', () => {
    const result = derivePlaceName({ town: 'Town', city: 'City', country: 'Country' });
    expect(result).toBe('City');
  });

  it('falls back to country when no locality fields exist', () => {
    const result = derivePlaceName({ country: 'Country' });
    expect(result).toBe('Country');
  });

  it('returns Unknown when address is missing', () => {
    expect(derivePlaceName(null)).toBe('Unknown');
  });
});
