import React, { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import BrandDeliverablesContent from './components/BrandDeliverablesContent';

export default function BrandDeliverablesPage() {
  return (
    <AppLayout role="brand">
      <Suspense fallback={<div className="py-12 text-center text-slate-500 text-sm">Loading deliverables...</div>}>
        <BrandDeliverablesContent />
      </Suspense>
    </AppLayout>
  );
}
