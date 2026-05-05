import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import DisputesContent from './components/DisputesContent';

export default function DisputesPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <DisputesContent />
    </AppLayout>
  );
}
