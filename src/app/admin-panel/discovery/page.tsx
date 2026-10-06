import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import AdminDiscoveryContent from './components/AdminDiscoveryContent';

export default function AdminDiscoveryPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <AdminDiscoveryContent />
    </AppLayout>
  );
}
