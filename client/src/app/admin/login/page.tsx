import { redirect } from 'next/navigation';
import { LoginForm } from './login-form';
import { adminRequest, AdminSession } from '@/lib/admin-api';

export default async function AdminLoginPage() {
  const sessionResult = await adminRequest<AdminSession>('/admin/me');

  if (sessionResult.data) {
    redirect('/admin');
  }

  return (
    <div className="admin-login">
      <div className="admin-login-header">
        <p className="admin-eyebrow">Secure access</p>
        <h1 className="admin-title">Admin sign-in</h1>
        <p className="admin-subtitle">
          Use your configured credentials to manage journeys and prompts.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
