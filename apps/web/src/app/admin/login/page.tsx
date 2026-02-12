import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionCookie,
  createAdminSessionToken,
  getAdminCredentials,
  isValidAdminSessionToken,
} from '@/lib/admin-auth';
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations } from '@/lib/i18n/translations';

export const dynamic = 'force-dynamic';
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; next?: string };
}) {
  const locale = getServerLocale();
  const t = getTranslations(locale);
  const credentials = getAdminCredentials();

  if (!credentials) {
    notFound();
  }

  const nextPath = normalizeNextPath(searchParams?.next);
  const cookieStore = cookies();
  const existingSession = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (existingSession) {
    const hasValidSession = await isValidAdminSessionToken(
      existingSession,
      credentials.user,
      credentials.password
    );
    if (hasValidSession) {
      redirect(nextPath);
    }
  }

  const hasInvalidCredentialsError = searchParams?.error === 'invalid_credentials';

  async function loginAction(formData: FormData) {
    'use server';

    const configuredCredentials = getAdminCredentials();
    if (!configuredCredentials) {
      notFound();
    }

    const providedUser = readString(formData.get('username'));
    const providedPassword = readString(formData.get('password'));
    const redirectTarget = normalizeNextPath(formData.get('next'));

    if (
      providedUser !== configuredCredentials.user ||
      providedPassword !== configuredCredentials.password
    ) {
      const loginUrl = new URL('/admin/login', 'http://localhost');
      loginUrl.searchParams.set('error', 'invalid_credentials');
      if (redirectTarget !== '/admin') {
        loginUrl.searchParams.set('next', redirectTarget);
      }
      redirect(`${loginUrl.pathname}${loginUrl.search}`);
    }

    const sessionToken = await createAdminSessionToken(
      configuredCredentials.user,
      configuredCredentials.password
    );

    cookies().set(createAdminSessionCookie(sessionToken));

    redirect(redirectTarget);
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SectionTopBar
        title={t.admin.login.title}
        theme="light"
        activeHref="/"
        className="border-b border-zinc-200 bg-zinc-100/95"
        navLabels={t.nav}
      />
      <PageContainer className="py-6 md:py-10">
        <div className="mx-auto w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 md:p-8">
          <p className="mb-6 text-sm text-zinc-600">{t.admin.login.description}</p>

          {hasInvalidCredentialsError ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {t.admin.login.errors.invalidCredentials}
            </div>
          ) : null}

          <form action={loginAction} className="flex flex-col gap-4">
            <input type="hidden" name="next" value={nextPath} />

            <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
              {t.admin.login.fields.username}
              <input
                name="username"
                autoComplete="username"
                required
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
              {t.admin.login.fields.password}
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
              />
            </label>

            <button type="submit" className="mt-2 h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white">
              {t.admin.login.actions.signIn}
            </button>
          </form>
        </div>
      </PageContainer>
    </div>
  );
}

function normalizeNextPath(value: FormDataEntryValue | string | undefined): string {
  const raw = typeof value === 'string' ? value : '';
  if (!raw.startsWith('/admin')) {
    return '/admin';
  }
  if (raw.startsWith('/admin/login')) {
    return '/admin';
  }
  return raw;
}

function readString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}
