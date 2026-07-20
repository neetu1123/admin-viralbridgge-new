import React, { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import CampaignDiscoveryContent from './components/CampaignDiscoveryContent';

export default function CampaignDiscoveryPage() {
  return (
    <AppLayout role="creator">
      <Suspense fallback={<div className="p-8 text-slate-500 text-sm">Loading campaigns...</div>}>
        <CampaignDiscoveryContent />
      </Suspense>
    </AppLayout>
  );
}