import AppLayout from '@/src/components/AppLayout';
import BrandCampaignContent from './components/BrandCampaignContent';
import { Suspense } from 'react';

export default function BrandCampaignManagementPage() {
  return (
    <AppLayout role="brand">
      <Suspense fallback={null}>
        <BrandCampaignContent />
      </Suspense>
    </AppLayout>
  );
}