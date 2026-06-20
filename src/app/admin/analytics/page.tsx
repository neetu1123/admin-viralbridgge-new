import { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '@/src/app/admin-panel/components/AdminTopNavbar';
import AdminAnalyticsContent from './components/AdminAnalyticsContent';

export default function AdminAnalyticsPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <Suspense fallback={<div className="p-8 text-slate-500 text-sm">Loading analytics...</div>}>
        <AdminAnalyticsContent />
      </Suspense>
    </AppLayout>
  );
}
