import { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import CreatorAnalyticsContent from './components/CreatorAnalyticsContent';

export default function CreatorAnalyticsPage() {
  return (
    <AppLayout role="creator">
      <Suspense fallback={<div className="p-8 text-slate-500 text-sm">Loading analytics...</div>}>
        <CreatorAnalyticsContent />
      </Suspense>
    </AppLayout>
  );
}
