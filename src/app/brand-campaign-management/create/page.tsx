import React, { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import CreateCampaignPageContent from './components/CreateCampaignPageContent';

export default function CreateCampaignPage() {
  return (
    <AppLayout role="brand">
      <Suspense fallback={<div className="py-12 text-center text-slate-500 text-sm">Loading...</div>}>
        <CreateCampaignPageContent />
      </Suspense>
    </AppLayout>
  );
}
