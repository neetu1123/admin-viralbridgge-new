import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '@/src/app/admin-panel/components/AdminTopNavbar';
import CrmDashboardContent from './components/CrmDashboardContent';

export default function CrmPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <CrmDashboardContent />
    </AppLayout>
  );
}
