'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { clearSsoChecked, parseSsoHash } from '@/src/lib/auth/sso';

export default function AuthReceiveClient() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Signing you in...');

  useEffect(() => {
    const parsed = parseSsoHash(window.location.hash);
    const next = searchParams.get('next') || '/campaign-discovery';

    if (!parsed) {
      setMessage('No session found. Redirecting...');
      clearSsoChecked();
      window.location.replace(next.startsWith('/') ? next : '/campaign-discovery');
      return;
    }

    localStorage.setItem('token', parsed.token);
    localStorage.setItem('user', JSON.stringify(parsed.user));
    clearSsoChecked();
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    window.location.replace(next.startsWith('/') ? next : '/campaign-discovery');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
}
