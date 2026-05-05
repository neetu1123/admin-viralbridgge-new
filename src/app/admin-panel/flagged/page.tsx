import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import FlaggedContent from './components/FlaggedContent';

export default function FlaggedPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <FlaggedContent />
    </AppLayout>
  );
}
