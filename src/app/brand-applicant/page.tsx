import AppLayout from '@/src/components/AppLayout';
import AdminUsersContent from './components/AdminUsersContent';

export default function AdminUsersPage() {
  return (
    <AppLayout role="brand" >
      <AdminUsersContent />
    </AppLayout>
  );
}
