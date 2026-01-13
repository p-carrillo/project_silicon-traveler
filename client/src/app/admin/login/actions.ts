'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { resolveAdminApiUrl } from '@/lib/admin-api';
import { parseSetCookieHeader } from '@/lib/cookie-utils';

export type LoginState = {
  status: 'idle' | 'error';
  message?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '').trim();

  if (!username || !password) {
    return {
      status: 'error',
      message: 'Enter both username and password.',
    };
  }

  const apiUrl = resolveAdminApiUrl();
  const response = await fetch(`${apiUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    cache: 'no-store',
  });

  if (response.status === 401) {
    return { status: 'error', message: 'Invalid username or password.' };
  }

  if (response.status === 429) {
    return { status: 'error', message: 'Too many attempts. Try again soon.' };
  }

  if (!response.ok) {
    return { status: 'error', message: 'Unable to sign in.' };
  }

  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) {
    return { status: 'error', message: 'Session cookie was not set.' };
  }

  const parsed = parseSetCookieHeader(setCookie);

  if (!parsed) {
    return { status: 'error', message: 'Session cookie could not be parsed.' };
  }

  cookies().set({
    name: parsed.name,
    value: parsed.value,
    ...parsed.options,
  });

  redirect('/admin');
}
