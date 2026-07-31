import React, { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import BrandCreatorProfileContent from './components/BrandCreatorProfileContent';

export default async function BrandCreatorProfilePage({
  params,
}: {
  params: Promise<{ creatorId: string }>;
}) {
  const { creatorId } = await params;
  return (
    <AppLayout role="brand">
      <Suspense fallback={<div className="py-12 text-center text-slate-500 text-sm">Loading profile...</div>}>
        <BrandCreatorProfileContent creatorId={creatorId} />
      </Suspense>
    </AppLayout>
  );
}
