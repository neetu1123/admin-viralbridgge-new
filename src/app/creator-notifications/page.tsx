import AppLayout from '@/src/components/AppLayout';
import CreatorNotificationsContent from './components/CreatorNotificationsContent';

export default function CreatorNotificationsPage() {
  return (
    <AppLayout role="creator">
      <CreatorNotificationsContent />
    </AppLayout>
  );
}
