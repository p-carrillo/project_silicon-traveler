import { describe, expect, it } from 'vitest';

import { getArchiveNavItems, getNavLinkClass } from '../../../src/lib/navigation';

describe('getArchiveNavItems', () => {
  it('returns navigation links with provided labels', () => {
    const navItems = getArchiveNavItems({
      journal: 'Journal',
      archive: 'Archive',
      map: 'Map',
    });

    expect(navItems).toEqual([
      { label: 'Journal', href: '/' },
      { label: 'Archive', href: '/archive' },
      { label: 'Map', href: '/map' },
    ]);
  });
});

describe('getNavLinkClass', () => {
  it('returns active and inactive classes for dark theme', () => {
    expect(getNavLinkClass('/', '/', 'dark')).toBe(
      'text-xs font-semibold uppercase tracking-[0.3em] text-white'
    );
    expect(getNavLinkClass('/archive', '/', 'dark')).toBe(
      'text-xs font-semibold uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors'
    );
  });

  it('returns active and inactive classes for light theme', () => {
    expect(getNavLinkClass('/archive', '/archive', 'light')).toBe(
      'text-xs font-semibold uppercase tracking-[0.3em] text-black border-b-2 border-black pb-1'
    );
    expect(getNavLinkClass('/', '/archive', 'light')).toBe(
      'text-xs font-semibold uppercase tracking-[0.3em] text-black/50 hover:text-black transition-colors'
    );
  });
});
