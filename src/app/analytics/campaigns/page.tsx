import React, { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import BrandCampaignAnalyticsContent from './components/BrandCampaignAnalyticsContent';

export default function BrandCampaignAnalyticsPage() {
  return (
    <AppLayout role="brand">
      <Suspense fallback={<div className="py-12 text-center text-slate-500 text-sm">Loading analytics...</div>}>
        <BrandCampaignAnalyticsContent />
      </Suspense>
    </AppLayout>
  );
}
