import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireAdminSession } from '@/lib/admin-session';
import { resolveAdminApiUrl } from '@/lib/admin-api';

const sessionCookieName = 'admin_session';

async function logout() {
  'use server';
  const apiUrl = resolveAdminApiUrl();
  const cookieHeader = cookies().toString();

  await fetch(`${apiUrl}/admin/logout`, {
    method: 'POST',
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: 'no-store',
  });

  cookies().delete(sessionCookieName);
  redirect('/admin/login');
}

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <div className="admin-stack">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Admin panel</p>
          <h1 className="admin-title">Journey controls</h1>
        </div>
        <div className="admin-meta">
          <span className="admin-user">Signed in as {session.username}</span>
          <form action={logout}>
            <button className="admin-button ghost" type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>
      <nav className="admin-nav" aria-label="Admin navigation">
        <Link href="/admin" className="admin-nav-link">
          Dashboard
        </Link>
        <Link href="/admin/prompts" className="admin-nav-link">
          Prompts
        </Link>
        <Link href="/admin/journeys" className="admin-nav-link">
          Journeys
        </Link>
        <Link href="/admin/commands" className="admin-nav-link">
          Commands
        </Link>
      </nav>
      {children}
    </div>
  );
}
