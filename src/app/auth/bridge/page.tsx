import React, { Suspense } from 'react';
import AuthBridgeClient from './AuthBridgeClient';

export default function AuthBridgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AuthBridgeClient />
    </Suspense>
  );
}
