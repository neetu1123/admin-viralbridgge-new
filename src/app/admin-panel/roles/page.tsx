import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import RolesContent from './components/RolesContent';

export default function RolesPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <RolesContent />
    </AppLayout>
  );
}
