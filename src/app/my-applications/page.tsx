import AppLayout from '@/src/components/AppLayout';
import MyApplicationsContent from './components/MyApplicationsContent';

export default function MyApplicationsPage() {
  return (
    <AppLayout role="creator">
      <MyApplicationsContent />
    </AppLayout>
  );
}
