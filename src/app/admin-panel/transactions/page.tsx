import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import AdminTransactionsContent from './components/AdminTransactionsContent';

export default function AdminTransactionsPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <AdminTransactionsContent />
    </AppLayout>
  );
}
