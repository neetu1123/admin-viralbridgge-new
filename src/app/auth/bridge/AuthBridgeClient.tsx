'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  buildBridgeRedirect,
  getAdminOrigins,
  getMarketingOrigins,
  isAllowedReturnUrl,
} from '@/src/lib/auth/sso';
import { getCurrentUser, getToken } from '@/src/lib/useAuth';

export default function AuthBridgeClient() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Checking your session...');

  useEffect(() => {
    const returnUrl = searchParams.get('returnUrl');
    if (!returnUrl || !isAllowedReturnUrl(returnUrl, [...getMarketingOrigins(), ...getAdminOrigins()])) {
      setMessage('Invalid return URL.');
      return;
    }

    const token = getToken();
    const user = getCurrentUser();
    if (token && user) {
      window.location.replace(buildBridgeRedirect(returnUrl, token, user));
      return;
    }

    const loginRedirect = encodeURIComponent(
      `/auth/bridge?returnUrl=${encodeURIComponent(returnUrl)}`,
    );
    window.location.replace(`/sign-up-login-screen?redirect=${loginRedirect}`);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
}
