import { describe, expect, it } from 'vitest';

import { ARCHIVE_NAV_ITEMS, getNavLinkClass } from '../../../src/lib/navigation';

describe('ARCHIVE_NAV_ITEMS', () => {
  it('includes the journal and archive links', () => {
    expect(ARCHIVE_NAV_ITEMS).toEqual([
      { label: 'Journal', href: '/' },
      { label: 'Archive', href: '/archive' },
    ]);
  });
});

describe('getNavLinkClass', () => {
  it('returns active and inactive classes for dark theme', () => {
    expect(getNavLinkClass('/', '/', 'dark')).toBe(
      'text-white text-xs font-medium uppercase tracking-[0.2em]'
    );
    expect(getNavLinkClass('/archive', '/', 'dark')).toBe(
      'text-white/50 hover:text-white transition-colors text-xs font-medium uppercase tracking-[0.2em]'
    );
  });

  it('returns active and inactive classes for light theme', () => {
    expect(getNavLinkClass('/archive', '/archive', 'light')).toBe(
      'text-black text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1'
    );
    expect(getNavLinkClass('/', '/archive', 'light')).toBe(
      'text-black/50 hover:text-black text-xs font-bold uppercase tracking-widest transition-colors'
    );
  });
});
