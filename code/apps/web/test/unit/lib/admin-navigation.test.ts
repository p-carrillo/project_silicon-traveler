import { describe, expect, it } from 'vitest';
import {
  getAdminNavigationItems,
  isAdminNavigationItemActive,
} from '../../../src/lib/admin-navigation';

describe('admin navigation', () => {
  it('provides dashboard and route-point creation destinations', () => {
    expect(
      getAdminNavigationItems({
        dashboard: 'Dashboard',
        createRoutePoint: 'Create route point',
      })
    ).toEqual([
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/route-points/new', label: 'Create route point' },
    ]);
  });

  it('adds the E2E destination only when the development label is provided', () => {
    expect(
      getAdminNavigationItems({
        dashboard: 'Dashboard',
        createRoutePoint: 'Create route point',
        e2eTests: 'Photo batch',
      })
    ).toContainEqual({ href: '/admin/e2e', label: 'Photo batch' });
  });

  it('keeps route-point editing associated with the dashboard', () => {
    expect(isAdminNavigationItemActive('/admin', '/admin/route-points/42')).toBe(true);
    expect(isAdminNavigationItemActive('/admin/route-points/new', '/admin/route-points/42')).toBe(false);
  });

  it('marks route-point creation as its own active destination', () => {
    expect(isAdminNavigationItemActive('/admin', '/admin/route-points/new')).toBe(false);
    expect(isAdminNavigationItemActive('/admin/route-points/new', '/admin/route-points/new')).toBe(true);
  });
});
