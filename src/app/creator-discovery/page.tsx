import React, { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import CreatorDiscoveryContent from './components/CreatorDiscoveryContent';

export default function CreatorDiscoveryPage() {
  return (
    <AppLayout role="brand">
      <Suspense fallback={<div className="p-8 text-slate-500 text-sm">Loading creators...</div>}>
        <CreatorDiscoveryContent />
      </Suspense>
    </AppLayout>
  );
}
