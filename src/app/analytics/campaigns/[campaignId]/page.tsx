import React, { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import CampaignAnalyticsDetailContent from './components/CampaignAnalyticsDetailContent';

export default function CampaignAnalyticsDetailPage() {
  return (
    <AppLayout role="brand">
      <Suspense fallback={<div className="py-12 text-center text-slate-500 text-sm">Loading campaign analytics...</div>}>
        <CampaignAnalyticsDetailContent />
      </Suspense>
    </AppLayout>
  );
}
