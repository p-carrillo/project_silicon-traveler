import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import {
  getArchiveNavItems,
  getNavLinkClass,
  type NavTheme,
} from '@/lib/navigation';

type SectionTopBarProps = {
  title: string;
  theme: NavTheme;
  activeHref: string;
  className?: string;
  navLabels: {
    journal: string;
    archive: string;
    map: string;
  };
};

const BRAND_LABEL = 'Silicon Traveler';

const themeStyles: Record<NavTheme, { title: string; subtitle: string; logo: string }> = {
  dark: {
    title: 'text-white',
    subtitle: 'text-white/40',
    logo: 'text-white',
  },
  light: {
    title: 'text-black',
    subtitle: 'text-black/50',
    logo: 'text-black',
  },
};

export default function SectionTopBar({
  title,
  theme,
  activeHref,
  className,
  navLabels,
}: SectionTopBarProps) {
  const styles = themeStyles[theme];
  const headerClassName = ['w-full', className].filter(Boolean).join(' ');
  const navItems = getArchiveNavItems(navLabels);

  return (
    <header className={headerClassName}>
      <PageContainer className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between py-8">
        <div className="flex items-center gap-6">
          <div className={`size-8 ${styles.logo}`} aria-hidden>
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 4H44V44H4V4ZM24 36C30.6274 36 36 30.6274 36 24C36 17.3726 30.6274 12 24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span
              className={`text-[10px] uppercase tracking-[0.4em] font-semibold ${styles.subtitle}`}
            >
              {BRAND_LABEL}
            </span>
            <h1
              className={`text-2xl md:text-3xl font-sans font-bold uppercase tracking-[0.08em] leading-none ${styles.title}`}
            >
              {title}
            </h1>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-12">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={getNavLinkClass(item.href, activeHref, theme)}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </PageContainer>
    </header>
  );
}
