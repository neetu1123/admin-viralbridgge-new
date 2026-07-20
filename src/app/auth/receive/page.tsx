import React, { Suspense } from 'react';
import AuthReceiveClient from './AuthReceiveClient';

export default function AuthReceivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AuthReceiveClient />
    </Suspense>
  );
}
