import { Suspense } from 'react';
import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import AdminCampaignsContent from './components/AdminCampaignsContent';

export default function AdminCampaignsPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <Suspense fallback={<div className="p-8 text-slate-500 text-sm">Loading campaigns...</div>}>
        <AdminCampaignsContent />
      </Suspense>
    </AppLayout>
  );
}
