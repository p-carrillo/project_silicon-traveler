export interface AdminNavigationLabels {
  dashboard: string;
  createRoutePoint: string;
}

export interface AdminNavigationItem {
  href: string;
  label: string;
}

export function getAdminNavigationItems(
  labels: AdminNavigationLabels
): AdminNavigationItem[] {
  return [
    { href: '/admin', label: labels.dashboard },
    { href: '/admin/route-points/new', label: labels.createRoutePoint },
  ];
}

export function isAdminNavigationItemActive(href: string, pathname: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin' || /^\/admin\/route-points\/\d+$/.test(pathname);
  }

  return pathname === href;
}
