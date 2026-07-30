import React, { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import MyApplicationsContent from './components/MyApplicationsContent';

export default function MyApplicationsPage() {
  return (
    <AppLayout role="creator">
      <Suspense fallback={<div className="py-12 text-center text-slate-500 text-sm">Loading campaigns...</div>}>
        <MyApplicationsContent />
      </Suspense>
    </AppLayout>
  );
}
