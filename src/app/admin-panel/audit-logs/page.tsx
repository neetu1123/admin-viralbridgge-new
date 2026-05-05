import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';
import AuditLogsContent from './components/AuditLogsContent';

export default function AuditLogsPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <AuditLogsContent />
    </AppLayout>
  );
}