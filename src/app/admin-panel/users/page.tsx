import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import AdminContent from '../components/AdminContent';

export default function AdminUsersPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <AdminContent />
    </AppLayout>
  );
}
