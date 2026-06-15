import React, { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import CampaignDetailContent from './components/CampaignDetailContent';

function CampaignDetailFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-slate-500 text-sm">Loading campaign...</p>
    </div>
  );
}

export default function CampaignDetailPage() {
  return (
    <AppLayout role="brand">
      <Suspense fallback={<CampaignDetailFallback />}>
        <CampaignDetailContent />
      </Suspense>
    </AppLayout>
  );
}