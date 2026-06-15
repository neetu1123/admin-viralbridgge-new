import { authApi } from './api';

const LOGIN_PATH = '/sign-up-login-screen';

/** Clear all client-side auth state */
export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/** Redirect to login without leaving protected page in history */
export function redirectToLogin(): void {
  window.location.replace(LOGIN_PATH);
}

/**
 * Full logout: notify backend (best-effort), clear session, redirect.
 * Always completes locally even if the API call fails.
 */
export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // Network/API errors must not block logout
  }
  clearSession();
  redirectToLogin();
}
