import 'server-only';
import { redirect } from 'next/navigation';
import { adminRequest, AdminSession } from './admin-api';

export async function requireAdminSession(): Promise<AdminSession> {
  const result = await adminRequest<AdminSession>('/admin/me');

  if (!result.data) {
    redirect('/admin/login');
  }

  return result.data;
}
