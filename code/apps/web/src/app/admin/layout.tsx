import type { ReactNode } from 'react';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import AdminShell from '@/components/admin/AdminShell';
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations } from '@/lib/i18n/translations';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const locale = getServerLocale();
  const t = getTranslations(locale);

  return (
    <AdminShell
      brandLabel={t.admin.shell.brandLabel}
      logoutButton={<AdminLogoutButton label={t.admin.actions.logout} />}
      navigationLabel={t.admin.shell.navigationLabel}
      navigationLabels={{
        dashboard: t.admin.shell.dashboard,
        createRoutePoint: t.admin.shell.createRoutePoint,
      }}
      productLabel={t.admin.shell.product}
    >
      {children}
    </AdminShell>
  );
}
