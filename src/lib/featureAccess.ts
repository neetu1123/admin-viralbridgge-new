export type FeatureAccess = 'LIMITED' | 'FULL';

export type AccessUser = {
  role?: string | null;
  feature_access?: string | null;
};

export function normalizeFeatureAccess(value?: string | null): FeatureAccess {
  if (value == null || value === '') return 'FULL';
  return String(value).toUpperCase() === 'LIMITED' ? 'LIMITED' : 'FULL';
}

export function isAdminRole(role?: string | null): boolean {
  const raw = String(role ?? '').toLowerCase();
  return raw === 'admin' || raw === 'super_admin';
}

export function isLimitedAccess(user?: AccessUser | null): boolean {
  if (!user || isAdminRole(user.role)) return false;
  const role = String(user.role ?? '').toLowerCase();
  if (role !== 'brand') return false;
  return normalizeFeatureAccess(user.feature_access) === 'LIMITED';
}

export function portalHome(user?: AccessUser | null): string {
  const role = String(user?.role ?? '').toLowerCase();
  if (isAdminRole(role)) return '/admin-panel';
  if (role === 'brand' && isLimitedAccess(user)) return '/my-listing';
  if (role === 'brand') return '/brand-campaign-management';
  return '/campaign-discovery';
}

export function isLimitedAllowedPath(pathname: string, role?: string | null): boolean {
  if (role !== 'brand') return true;
  const prefixes = [
    '/grow-business',
    '/my-listing',
    '/subscription',
    '/support',
    '/brand-settings',
    '/brand-notifications',
  ];
  return prefixes.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
