import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import AdminSupportContent from './components/AdminSupportContent';

export default function AdminSupportPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <AdminSupportContent />
    </AppLayout>
  );
}
