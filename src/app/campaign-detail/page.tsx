import React from 'react';
import AppLayout from '@/src/components/AppLayout';
import CampaignDetailContent from './components/CampaignDetailContent';

export default function CampaignDetailPage() {
  return (
    <AppLayout role="brand">
      <CampaignDetailContent />
    </AppLayout>
  );
}