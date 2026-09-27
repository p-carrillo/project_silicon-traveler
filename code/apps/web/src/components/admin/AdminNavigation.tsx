'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getAdminNavigationItems,
  isAdminNavigationItemActive,
  type AdminNavigationLabels,
} from '@/lib/admin-navigation';

interface AdminNavigationProps {
  labels: AdminNavigationLabels;
  navigationLabel: string;
}

export default function AdminNavigation({
  labels,
  navigationLabel,
}: AdminNavigationProps) {
  const pathname = usePathname();
  const items = getAdminNavigationItems(labels);

  return (
    <nav aria-label={navigationLabel} className="overflow-x-auto px-4 pb-4 lg:px-5 lg:pb-0">
      <ul className="flex min-w-max gap-2 lg:flex-col lg:gap-1">
        {items.map((item) => {
          const isActive = isAdminNavigationItemActive(item.href, pathname);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex h-12 items-center rounded-md px-4 text-sm font-semibold transition-colors motion-reduce:transition-none lg:flex lg:w-full ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:bg-zinc-100 focus-visible:bg-zinc-100'
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
