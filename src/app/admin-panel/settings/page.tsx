import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import AdminSettingsContent from './components/AdminSettingsContent';

export default function AdminSettingsPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <AdminSettingsContent />
    </AppLayout>
  );
}
