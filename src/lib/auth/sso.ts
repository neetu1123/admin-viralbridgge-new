export interface SsoUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

const DEFAULT_MARKETING_ORIGINS = [
  'https://viralbridgge-new.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

const DEFAULT_ADMIN_ORIGINS = [
  'https://admin-viralbridgge-new.vercel.app',
  'http://localhost:3002',
  'http://localhost:3000',
];

export function getMarketingOrigins(): string[] {
  const fromEnv = process.env.NEXT_PUBLIC_MARKETING_URL?.trim();
  return [...new Set([...(fromEnv ? [fromEnv.replace(/\/$/, '')] : []), ...DEFAULT_MARKETING_ORIGINS])];
}

export function getAdminOrigins(): string[] {
  const fromEnv = process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
  return [...new Set([...(fromEnv ? [fromEnv.replace(/\/$/, '')] : []), ...DEFAULT_ADMIN_ORIGINS])];
}

export function isAllowedReturnUrl(returnUrl: string, allowedOrigins: string[]): boolean {
  try {
    const url = new URL(returnUrl);
    return allowedOrigins.includes(url.origin);
  } catch {
    return false;
  }
}

export function buildBridgeRedirect(returnUrl: string, token: string, user: SsoUser): string {
  const hash = new URLSearchParams({
    access_token: token,
    user: JSON.stringify(user),
  }).toString();
  return `${returnUrl}#${hash}`;
}

export function parseSsoHash(hash: string): { token: string; user: SsoUser } | null {
  if (!hash) return null;
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(raw);
  const token = params.get('access_token');
  const userRaw = params.get('user');
  if (!token || !userRaw) return null;
  try {
    return { token, user: JSON.parse(userRaw) as SsoUser };
  } catch {
    return null;
  }
}

export const SSO_SESSION_KEY = 'vb_sso_checked';

export function markSsoChecked(): void {
  sessionStorage.setItem(SSO_SESSION_KEY, Date.now().toString());
}

export function wasSsoCheckedRecently(maxAgeMs = 5 * 60 * 1000): boolean {
  const raw = sessionStorage.getItem(SSO_SESSION_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts < maxAgeMs;
}

export function clearSsoChecked(): void {
  sessionStorage.removeItem(SSO_SESSION_KEY);
}

export function buildMarketingBridgeUrl(receiveUrl: string): string {
  const marketingBase = (process.env.NEXT_PUBLIC_MARKETING_URL || 'https://viralbridgge-new.vercel.app').replace(/\/$/, '');
  return `${marketingBase}/auth/bridge?returnUrl=${encodeURIComponent(receiveUrl)}`;
}

export function buildAdminBridgeUrl(receiveUrl: string): string {
  const adminBase = (process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin-viralbridgge-new.vercel.app').replace(/\/$/, '');
  return `${adminBase}/auth/bridge?returnUrl=${encodeURIComponent(receiveUrl)}`;
}

export function buildMarketingLoginUrl(nextPath = '/'): string {
  const marketingBase = (process.env.NEXT_PUBLIC_MARKETING_URL || 'https://viralbridgge-new.vercel.app').replace(/\/$/, '');
  const receiveUrl = `${marketingBase}/auth/receive?next=${encodeURIComponent(nextPath)}`;
  const bridgePath = `/auth/bridge?returnUrl=${encodeURIComponent(receiveUrl)}`;
  const adminBase = (process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin-viralbridgge-new.vercel.app').replace(/\/$/, '');
  return `${adminBase}/sign-up-login-screen?redirect=${encodeURIComponent(bridgePath)}`;
}
