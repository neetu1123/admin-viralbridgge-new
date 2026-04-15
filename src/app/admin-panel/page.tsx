import AppLayout from '@/src/components/AppLayout';
import AdminContent from './components/AdminContent';

export default function AdminPanelPage() {
  return (
    <AppLayout role="admin">
      <AdminContent />
    </AppLayout>
  );
}