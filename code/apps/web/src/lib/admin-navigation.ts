export interface AdminNavigationLabels {
  dashboard: string;
  createRoutePoint: string;
  e2eTests?: string;
  e2eResearch?: string;
}

export interface AdminNavigationItem {
  href: string;
  label: string;
}

export function getAdminNavigationItems(labels: AdminNavigationLabels): AdminNavigationItem[] {
  const items: AdminNavigationItem[] = [
    { href: '/admin', label: labels.dashboard },
    { href: '/admin/route-points/new', label: labels.createRoutePoint },
  ];
  if (labels.e2eTests) items.push({ href: '/admin/e2e', label: labels.e2eTests });
  if (labels.e2eResearch) items.push({ href: '/admin/e2e/research', label: labels.e2eResearch });
  return items;
}

export function isAdminNavigationItemActive(href: string, pathname: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin' || /^\/admin\/route-points\/\d+$/.test(pathname);
  }

  return pathname === href;
}
