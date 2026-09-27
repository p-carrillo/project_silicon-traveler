import type { Metadata } from 'next'
import Script from 'next/script'
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations } from '@/lib/i18n/translations';
import CookieBanner from '@/components/layout/CookieBanner';
import './globals.css'

export function generateMetadata(): Metadata {
  const locale = getServerLocale();
  const t = getTranslations(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = getServerLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className="font-sans"
        suppressHydrationWarning
      >
        {children}
        <CookieBanner locale={locale} />
        <Script
          src="https://metrics.diteria.net/script.js"
          data-website-id="2f564273-011b-4938-a713-08763ec04d31"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
