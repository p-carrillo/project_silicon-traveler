import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminSessionCookie } from '@/lib/admin-auth';

interface AdminLogoutButtonProps {
  label: string;
}

export default function AdminLogoutButton({ label }: AdminLogoutButtonProps) {
  async function logoutAction() {
    'use server';

    cookies().set(
      createAdminSessionCookie('', {
        maxAge: 0,
      })
    );

    redirect('/admin/login');
  }

  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900"
      >
        {label}
      </button>
    </form>
  );
}
