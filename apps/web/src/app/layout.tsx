import type { Metadata } from 'next'
import { Inter, Playfair_Display, Crimson_Pro } from 'next/font/google'
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations } from '@/lib/i18n/translations';
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-serif',
  display: 'swap',
})

const crimson = Crimson_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-archive-serif',
  display: 'swap',
})

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
        className={`${inter.variable} ${playfair.variable} ${crimson.variable} font-sans`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
