import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import EscrowContent from './components/EscrowContent';

export default function EscrowPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <EscrowContent />
    </AppLayout>
  );
}