import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import AdminCampaignsContent from './components/AdminCampaignsContent';

export default function AdminCampaignsPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <AdminCampaignsContent />
    </AppLayout>
  );
}
