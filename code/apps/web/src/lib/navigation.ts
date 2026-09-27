export type NavItem = {
  label: string;
  href: string;
};

export type NavTheme = 'dark' | 'light';

export const getArchiveNavItems = (labels: {
  journal: string;
  archive: string;
  map: string;
}): NavItem[] => [
  { label: labels.journal, href: '/' },
  { label: labels.archive, href: '/archive' },
  { label: labels.map, href: '/map' },
];

export const getNavLinkClass = (
  href: string,
  activeHref: string,
  theme: NavTheme
): string => {
  const isActive = href === activeHref;
  const base = 'text-xs font-semibold uppercase tracking-[0.3em]';

  if (theme === 'dark') {
    return isActive
      ? `${base} text-white`
      : `${base} text-white/50 hover:text-white transition-colors`;
  }

  return isActive
    ? `${base} text-black`
    : `${base} text-black/50 hover:text-black transition-colors`;
};
