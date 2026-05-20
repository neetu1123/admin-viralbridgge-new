import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import AdminUsersContent from './components/AdminUsersContent';

export default function AdminUsersPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <AdminUsersContent />
    </AppLayout>
  );
}
