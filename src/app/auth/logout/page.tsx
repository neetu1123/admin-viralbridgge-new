import React, { Suspense } from 'react';
import AuthLogoutClient from './AuthLogoutClient';

export default function AuthLogoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AuthLogoutClient />
    </Suspense>
  );
}
