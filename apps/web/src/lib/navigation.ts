export type NavItem = {
  label: string;
  href: string;
};

export type NavTheme = 'dark' | 'light';

export const ARCHIVE_NAV_ITEMS: NavItem[] = [
  { label: 'Journal', href: '/' },
  { label: 'Archive', href: '/archive' },
];

export const getNavLinkClass = (
  href: string,
  activeHref: string,
  theme: NavTheme
): string => {
  const isActive = href === activeHref;

  if (theme === 'dark') {
    return isActive
      ? 'text-white text-xs font-medium uppercase tracking-[0.2em]'
      : 'text-white/50 hover:text-white transition-colors text-xs font-medium uppercase tracking-[0.2em]';
  }

  return isActive
    ? 'text-black text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1'
    : 'text-black/50 hover:text-black text-xs font-bold uppercase tracking-widest transition-colors';
};
