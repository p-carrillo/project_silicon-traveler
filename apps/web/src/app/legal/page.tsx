import Link from 'next/link';
import type { Metadata } from 'next';
import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import Footer from '@/components/layout/Footer';
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations } from '@/lib/i18n/translations';

export function generateMetadata(): Metadata {
  const locale = getServerLocale();
  const t = getTranslations(locale);
  return {
    title: `${t.legal.title} — Silicon Traveler`,
    description: t.legal.noticeIntro,
  };
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl md:text-3xl font-sans font-bold uppercase tracking-[0.06em] mt-16 mb-6 pt-8 border-t border-black/10 scroll-mt-24"
    >
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-[0.15em] mt-8 mb-3">
      {children}
    </h3>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-black/70 mb-4 font-archive">
      {children}
    </p>
  );
}

function InfoLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-black/70 font-archive">{children}</p>
  );
}

export default function LegalPage() {
  const locale = getServerLocale();
  const t = getTranslations(locale);

  const sections = [
    { id: 'notice', label: t.legal.noticeTitle },
    { id: 'privacy', label: t.legal.privacyTitle },
    { id: 'cookies', label: t.legal.cookiesTitle },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <SectionTopBar
        title={t.legal.title}
        theme="light"
        activeHref="/legal"
        className="sticky top-0 z-50 border-b border-black bg-white/95 backdrop-blur-sm"
        navLabels={t.nav}
      />

      <main className="flex-1">
        <PageContainer className="py-12 max-w-3xl">
          {/* Last updated */}
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 mb-8">
            {t.legal.lastUpdated}
          </p>

          {/* Table of contents */}
          <nav aria-label={t.legal.tableOfContents} className="mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4">
              {t.legal.tableOfContents}
            </p>
            <ol className="list-decimal list-inside space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={`#${section.id}`}
                    className="text-sm font-archive text-black/60 hover:text-black underline underline-offset-2 transition-colors"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── Legal Notice ── */}
          <SectionHeading id="notice">{t.legal.noticeTitle}</SectionHeading>
          <Paragraph>{t.legal.noticeIntro}</Paragraph>

          <SubHeading>{t.legal.noticeOwnerTitle}</SubHeading>
          <div className="space-y-1 mb-4">
            <InfoLine>{t.legal.noticeOwnerName}</InfoLine>
            <InfoLine>{t.legal.noticeOwnerEmail}</InfoLine>
            <InfoLine>{t.legal.noticeOwnerDomain}</InfoLine>
          </div>

          <SubHeading>{t.legal.noticePurposeTitle}</SubHeading>
          <Paragraph>{t.legal.noticePurposeText}</Paragraph>

          <SubHeading>{t.legal.noticeIpTitle}</SubHeading>
          <Paragraph>{t.legal.noticeIpText}</Paragraph>

          <SubHeading>{t.legal.noticeLiabilityTitle}</SubHeading>
          <Paragraph>{t.legal.noticeLiabilityText}</Paragraph>

          <SubHeading>{t.legal.noticeLawTitle}</SubHeading>
          <Paragraph>{t.legal.noticeLawText}</Paragraph>

          {/* ── Privacy Policy ── */}
          <SectionHeading id="privacy">{t.legal.privacyTitle}</SectionHeading>
          <Paragraph>{t.legal.privacyIntro}</Paragraph>

          <SubHeading>{t.legal.privacyControllerTitle}</SubHeading>
          <Paragraph>{t.legal.privacyControllerText}</Paragraph>

          <SubHeading>{t.legal.privacyDataTitle}</SubHeading>
          <Paragraph>{t.legal.privacyDataText}</Paragraph>

          <SubHeading>{t.legal.privacyPurposeTitle}</SubHeading>
          <Paragraph>{t.legal.privacyPurposeText}</Paragraph>

          <SubHeading>{t.legal.privacyBasisTitle}</SubHeading>
          <Paragraph>{t.legal.privacyBasisText}</Paragraph>

          <SubHeading>{t.legal.privacyRightsTitle}</SubHeading>
          <Paragraph>{t.legal.privacyRightsText}</Paragraph>

          <SubHeading>{t.legal.privacyRetentionTitle}</SubHeading>
          <Paragraph>{t.legal.privacyRetentionText}</Paragraph>

          {/* ── Cookie Policy ── */}
          <SectionHeading id="cookies">{t.legal.cookiesTitle}</SectionHeading>
          <Paragraph>{t.legal.cookiesIntro}</Paragraph>

          <SubHeading>{t.legal.cookiesWhatTitle}</SubHeading>
          <Paragraph>{t.legal.cookiesWhatText}</Paragraph>

          <SubHeading>{t.legal.cookiesTypesTitle}</SubHeading>
          <div className="space-y-4 mb-4">
            <div className="border border-black/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2">
                {t.legal.cookiesTechnicalLabel}
              </p>
              <p className="text-sm leading-relaxed text-black/70 font-archive">
                {t.legal.cookiesTechnicalText}
              </p>
            </div>
            <div className="border border-black/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2">
                {t.legal.cookiesPreferenceLabel}
              </p>
              <p className="text-sm leading-relaxed text-black/70 font-archive">
                {t.legal.cookiesPreferenceText}
              </p>
            </div>
          </div>

          <SubHeading>{t.legal.cookiesManageTitle}</SubHeading>
          <Paragraph>{t.legal.cookiesManageText}</Paragraph>

          <SubHeading>{t.legal.cookiesChangesTitle}</SubHeading>
          <Paragraph>{t.legal.cookiesChangesText}</Paragraph>
        </PageContainer>
      </main>

      <Footer theme="light" stats={null} t={t} locale={locale} />
    </div>
  );
}
