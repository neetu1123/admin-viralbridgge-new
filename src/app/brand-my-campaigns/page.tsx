import React, { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import BrandMyCampaignsContent from './components/BrandMyCampaignsContent';

export default function BrandMyCampaignsPage() {
  return (
    <AppLayout role="brand">
      <Suspense fallback={<div className="py-12 text-center text-slate-500 text-sm">Loading campaigns...</div>}>
        <BrandMyCampaignsContent />
      </Suspense>
    </AppLayout>
  );
}
