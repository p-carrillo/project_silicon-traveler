'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from '@/lib/i18n/translations';

const CONSENT_KEY = 'cookie-consent';

type ConsentValue = 'accepted' | 'rejected';

type BannerTheme = 'light' | 'dark';

function getBannerTheme(pathname: string): BannerTheme {
  if (pathname === '/' || pathname.startsWith('/photo')) {
    return 'light';
  }
  return 'dark';
}

const themeStyles: Record<
  BannerTheme,
  { card: string; button: string; link: string }
> = {
  light: {
    card: 'bg-white text-black border border-black/10 shadow-2xl',
    button:
      'border border-black text-black hover:bg-black hover:text-white transition-colors',
    link: 'text-black/60 hover:text-black underline underline-offset-2 transition-colors',
  },
  dark: {
    card: 'bg-black text-white border border-white/10 shadow-2xl',
    button:
      'border border-white text-white hover:bg-white hover:text-black transition-colors',
    link: 'text-white/60 hover:text-white underline underline-offset-2 transition-colors',
  },
};

type CookieBannerProps = {
  locale: string;
};

export default function CookieBanner({ locale }: CookieBannerProps) {
  const pathname = usePathname();
  const t = getTranslations(locale);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored !== 'accepted' && stored !== 'rejected') {
      setVisible(true);
    }
  }, []);

  const handleConsent = useCallback((value: ConsentValue) => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  }, []);

  if (!visible) {
    return null;
  }

  const theme = getBannerTheme(pathname);
  const styles = themeStyles[theme];

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] w-80 ${styles.card} animate-fade-up`}
      role="region"
      aria-label="Cookie consent"
    >
      <div className="flex flex-col gap-4 p-6">
        <p className="text-xs leading-relaxed">
          {t.cookie.message}
          {' '}
          <Link href="/legal#cookies" className={`${styles.link} text-xs`}>
            {t.cookie.learnMore}
          </Link>
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleConsent('rejected')}
            className={`${styles.button} flex-1 py-2 text-[10px] font-bold uppercase tracking-[0.2em]`}
          >
            {t.cookie.reject}
          </button>
          <button
            type="button"
            onClick={() => handleConsent('accepted')}
            className={`${styles.button} flex-1 py-2 text-[10px] font-bold uppercase tracking-[0.2em]`}
          >
            {t.cookie.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
