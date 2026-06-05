'use client';
// ─── Role-Based Auth Guard ────────────────────────────────────────────────────
// Use this hook on any page to protect it. It reads the user from localStorage
// and redirects to login if not authenticated or wrong role.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export function useAuth(requiredRole?: 'admin' | 'brand' | 'creator') {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      window.location.href = '/sign-up-login-screen';
      return;
    }

    try {
      const parsedUser: AuthUser = JSON.parse(userStr);
      setUser(parsedUser);

      // Role check
      if (requiredRole) {
        const userRole = (parsedUser.role || '').toLowerCase().replace('super_', '');
        const normalizedRequired = requiredRole === 'admin'
          ? ['admin']
          : [requiredRole];
        const isAdmin = ['admin', 'super_admin'].includes((parsedUser.role || '').toLowerCase());
        const roleOk =
          requiredRole === 'admin'
            ? isAdmin
            : normalizedRequired.includes(userRole);
        if (!roleOk) {
          const raw = (parsedUser.role || '').toLowerCase();
          const home =
            raw === 'brand'
              ? '/brand-campaign-management'
              : raw === 'creator'
                ? '/campaign-discovery'
                : raw === 'admin' || raw === 'super_admin'
                  ? '/admin-panel'
                  : '/sign-up-login-screen';
          window.location.href = home;
          return;
        }
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/sign-up-login-screen';
      return;
    }

    setLoading(false);
  }, [requiredRole]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/sign-up-login-screen';
  };

  return { user, loading, logout };
}

// ─── Helper: Get current user from localStorage ───────────────────────────────
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
}

// ─── Helper: Get token ────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// ─── Helper: Is logged in ─────────────────────────────────────────────────────
export function isLoggedIn(): boolean {
  return !!getToken();
}
