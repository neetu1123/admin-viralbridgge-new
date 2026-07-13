import { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '@/src/app/admin-panel/components/AdminTopNavbar';
import UserAnalyticsDetailContent from './components/UserAnalyticsDetailContent';

export default function UserAnalyticsPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <Suspense fallback={<div className="p-8 text-slate-500 text-sm">Loading user analytics...</div>}>
        <UserAnalyticsDetailContent />
      </Suspense>
    </AppLayout>
  );
}
