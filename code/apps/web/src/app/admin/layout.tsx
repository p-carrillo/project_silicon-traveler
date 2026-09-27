import type { ReactNode } from 'react';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import AdminShell from '@/components/admin/AdminShell';
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations } from '@/lib/i18n/translations';
import { isE2EDevelopmentEnabled } from '@/lib/e2e';

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
        e2eTests: isE2EDevelopmentEnabled() ? t.admin.shell.e2eTests : undefined,
      }}
      productLabel={t.admin.shell.product}
    >
      {children}
    </AdminShell>
  );
}
