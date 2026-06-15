import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import AdminKycContent from './components/AdminKycContent';

export default function AdminKycPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <AdminKycContent />
    </AppLayout>
  );
}
