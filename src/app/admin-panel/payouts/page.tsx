import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import PayoutsContent from './components/PayoutsContent';

export default function PayoutsPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <PayoutsContent />
    </AppLayout>
  );
}
