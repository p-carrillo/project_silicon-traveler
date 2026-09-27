'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import type { AdminNavigationLabels } from '@/lib/admin-navigation';

interface AdminShellProps {
  children: ReactNode;
  brandLabel: string;
  logoutButton: ReactNode;
  navigationLabel: string;
  navigationLabels: AdminNavigationLabels;
  productLabel: string;
}

export default function AdminShell({
  children,
  brandLabel,
  logoutButton,
  navigationLabel,
  navigationLabels,
  productLabel,
}: AdminShellProps) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="border-b border-zinc-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
              {brandLabel}
            </p>
            <p className="mt-1 text-lg font-bold tracking-tight text-zinc-950">{productLabel}</p>
          </div>
        </div>
        <AdminNavigation labels={navigationLabels} navigationLabel={navigationLabel} />
        <div className="border-t border-zinc-200 p-4 lg:mt-auto lg:p-5">
          {logoutButton}
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 md:px-8 md:py-10 lg:px-10">{children}</main>
    </div>
  );
}
