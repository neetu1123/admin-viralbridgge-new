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
  return normalizeFeatureAccess(user.feature_access) !== 'FULL';
}

export function portalHome(user?: AccessUser | null): string {
  const role = String(user?.role ?? '').toLowerCase();
  if (isAdminRole(role)) return '/admin-panel';
  if (isLimitedAccess(user)) return '/grow-business';
  if (role === 'brand') return '/brand-campaign-management';
  return '/campaign-discovery';
}

export function isLimitedAllowedPath(pathname: string, role?: string | null): boolean {
  const prefixes = [
    '/grow-business',
    '/my-listing',
    '/subscription',
    '/support',
    '/brand-settings',
    '/creator-settings',
    '/creator-profile',
    '/brand-notifications',
    '/creator-notifications',
  ];
  if (role === 'brand') {
    return prefixes
      .filter((path) => !path.startsWith('/creator-'))
      .some((path) => pathname === path || pathname.startsWith(`${path}/`));
  }
  return prefixes.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
