import React from 'react';
import AppLayout from '@/src/components/AppLayout';
import ApplyCampaignPageContent from './components/ApplyCampaignPageContent';

interface PageProps {
  params: Promise<{ campaignId: string }>;
}

export default async function ApplyCampaignPage({ params }: PageProps) {
  const { campaignId } = await params;

  return (
    <AppLayout role="creator">
      <ApplyCampaignPageContent campaignId={campaignId} />
    </AppLayout>
  );
}
