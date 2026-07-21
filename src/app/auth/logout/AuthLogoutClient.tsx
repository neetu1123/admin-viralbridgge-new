'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMarketingOrigins, isAllowedReturnUrl } from '@/src/lib/auth/sso';
import { clearSession } from '@/src/lib/auth';

export default function AuthLogoutClient() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Signing you out...');

  useEffect(() => {
    const returnUrl = searchParams.get('returnUrl') || '/sign-up-login-screen';
    const allowed = isAllowedReturnUrl(returnUrl, getMarketingOrigins());

    const token = localStorage.getItem('token');
    if (token) {
      try {
        void fetch(
          `${(process.env.NEXT_PUBLIC_API_URL || 'https://backend-admin-viralbridgge-new-three.vercel.app').replace(/\/$/, '')}/auth/logout`,
          {
            method: 'POST',
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
        );
      } catch {
        // ignore
      }
    }

    clearSession();

    setMessage('Redirecting...');
    window.location.replace(allowed ? returnUrl : '/sign-up-login-screen');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
}
